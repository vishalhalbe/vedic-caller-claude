#!/usr/bin/env node
/**
 * ╔══════════════════════════════════════════════════════╗
 * ║  COSMICSAGE MULTI-AGENT ORCHESTRATOR               ║
 * ║                                                      ║
 * ║  Runs the full agent pipeline:                      ║
 * ║  Triage → Plan → Code → QA → Review → Deploy       ║
 * ║                                                      ║
 * ║  Usage:                                              ║
 * ║    ISSUE_NUMBER=5 node agents/orchestrator/run.js  ║
 * ╚══════════════════════════════════════════════════════╝
 */

import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'

const PIPELINE = [
  { name: 'triage',   script: 'agents/planner/triage.js',     requiredEnv: ['ISSUE_NUMBER'] },
  { name: 'planner',  script: 'agents/planner/plan.js',        requiredEnv: ['ISSUE_NUMBER'] },
  { name: 'coder',    script: 'agents/coder/implement.js',     requiredEnv: ['ISSUE_NUMBER', 'PLAN_FILE'] },
  { name: 'qa',       script: 'agents/qa/test.js',             requiredEnv: ['ISSUE_NUMBER', 'PLAN_FILE'] },
  { name: 'reviewer', script: 'agents/reviewer/review.js',     requiredEnv: ['PR_NUMBER'] },
  { name: 'deployer', script: 'agents/deployer/deploy.js',     requiredEnv: [] },
]

const state = {
  issueNumber: process.env.ISSUE_NUMBER,
  prNumber: process.env.PR_NUMBER,
  branchName: null,
  triageResult: null,
  plan: null,
  coderResult: null,
  qaResult: null,
  reviewResult: null,
  deployResult: null,
}

function runAgent(agentName, script, extraEnv = {}) {
  return new Promise((resolve, reject) => {
    console.log(`\n${'═'.repeat(60)}`)
    console.log(`🤖 AGENT: ${agentName.toUpperCase()}`)
    console.log(`${'═'.repeat(60)}`)

    const env = {
      ...process.env,
      ...extraEnv,
      FORCE_COLOR: '1',
    }

    const proc = spawn('node', [script], { env, stdio: ['inherit', 'pipe', 'pipe'] })
    const stdout = []
    const stderr = []

    proc.stdout.on('data', d => {
      process.stdout.write(d)
      stdout.push(d.toString())
    })
    proc.stderr.on('data', d => {
      process.stderr.write(d)
      stderr.push(d.toString())
    })

    proc.on('close', (code) => {
      const output = stdout.join('')
      let parsed = null
      try {
        // Try to parse the last JSON block from stdout
        const jsonMatch = output.match(/(\{[\s\S]*\})\s*$/)
        if (jsonMatch) parsed = JSON.parse(jsonMatch[1])
      } catch { /* not JSON output */ }

      if (code === 0) {
        console.log(`\n✅ ${agentName} completed`)
        resolve({ code, output, parsed })
      } else {
        console.error(`\n❌ ${agentName} failed with code ${code}`)
        reject(new Error(`Agent ${agentName} exited with code ${code}\n${stderr.join('')}`))
      }
    })
  })
}

async function runPipeline() {
  const startTime = Date.now()
  const issueNumber = state.issueNumber
  const mode = process.env.AGENT_MODE || 'full' // full | issue | pr-review

  console.log(`
╔══════════════════════════════════════════════════════╗
║     CosmicSage Multi-Agent Pipeline                  ║
║     Mode: ${mode.padEnd(44)}║
║     Issue: #${String(issueNumber || 'N/A').padEnd(43)}║
╚══════════════════════════════════════════════════════╝
`)

  const results = {}

  try {
    // ── 1. TRIAGE ────────────────────────────────────
    if (mode === 'full' || mode === 'issue') {
      const r = await runAgent('triage', 'agents/planner/triage.js', { ISSUE_NUMBER: issueNumber })
      state.triageResult = r.parsed
      results.triage = r.parsed

      // Skip if wontfix
      if (r.parsed?.routeTo === 'wontfix') {
        console.log('\n⛔ Triage routed to wontfix — pipeline halted.')
        return summarize(results, startTime)
      }
    }

    // ── 2. PLANNER ───────────────────────────────────
    if (mode === 'full' || mode === 'issue') {
      const r = await runAgent('planner', 'agents/planner/plan.js', {
        ISSUE_NUMBER: issueNumber,
        TRIAGE_RESULT: JSON.stringify(state.triageResult || {}),
      })
      state.plan = r.parsed
      results.plan = r.parsed
      // Save plan to disk for downstream agents
      fs.writeFileSync('/tmp/cosmicsage_plan.json', JSON.stringify(state.plan, null, 2))
    }

    // ── 3. CODER ─────────────────────────────────────
    if (mode === 'full') {
      const r = await runAgent('coder', 'agents/coder/implement.js', {
        ISSUE_NUMBER: issueNumber,
        PLAN_FILE: '/tmp/cosmicsage_plan.json',
        MAX_TASKS: '4',
      })
      state.coderResult = r.parsed
      state.branchName = r.parsed?.branchName
      results.coder = r.parsed
    }

    // ── 4. QA ────────────────────────────────────────
    if (mode === 'full') {
      const r = await runAgent('qa', 'agents/qa/test.js', {
        ISSUE_NUMBER: issueNumber,
        PLAN_FILE: '/tmp/cosmicsage_plan.json',
        BRANCH_NAME: state.branchName,
      })
      state.qaResult = r.parsed
      results.qa = r.parsed
    }

    // ── 5. REVIEWER ──────────────────────────────────
    if (mode === 'full' || mode === 'pr-review') {
      const prNum = state.prNumber || process.env.PR_NUMBER
      if (prNum) {
        const r = await runAgent('reviewer', 'agents/reviewer/review.js', {
          PR_NUMBER: prNum,
        })
        state.reviewResult = r.parsed
        results.reviewer = r.parsed
      } else {
        console.log('\n⏭️  No PR number — skipping reviewer')
      }
    }

    // ── 6. DEPLOYER ──────────────────────────────────
    if (mode === 'full') {
      const r = await runAgent('deployer', 'agents/deployer/deploy.js', {
        ISSUE_NUMBER: issueNumber,
        BRANCH_NAME: state.branchName,
        REVIEW_VERDICT:  state.reviewResult?.verdict       || 'COMMENT',
        REVIEW_SCORE:    String(state.reviewResult?.avgScore    || 7),
        CRITICAL_COUNT:  String(state.reviewResult?.criticals   || 0),
        COVERAGE_SCORE:  String(state.qaResult?.coverage?.coverageScore || 70),
        TEST_COUNT:      String(state.qaResult?.generatedTests?.length   || 0),
        DEPLOY_ENV:      process.env.DEPLOY_ENV || 'staging',
      })
      state.deployResult = r.parsed
      results.deployer = r.parsed
    }

  } catch (err) {
    console.error(`\n💥 Pipeline failed: ${err.message}`)
    process.exitCode = 1
  }

  return summarize(results, startTime)
}

function summarize(results, startTime) {
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1)

  console.log(`\n${'═'.repeat(60)}`)
  console.log('📊 PIPELINE SUMMARY')
  console.log(`${'═'.repeat(60)}`)

  const stages = [
    ['Triage',   results.triage,   r => r?.routeTo],
    ['Planner',  results.plan,     r => `${r?.tasks?.length || 0} tasks`],
    ['Coder',    results.coder,    r => `${r?.implementedTasks?.length || 0} files`],
    ['QA',       results.qa,       r => `${r?.generatedTests?.length || 0} tests`],
    ['Reviewer', results.reviewer, r => r?.verdict],
    ['Deployer', results.deployer, r => r?.decision?.targetEnvironment],
  ]

  stages.forEach(([name, data, fmt]) => {
    const icon = data ? '✅' : '⏭️ '
    const detail = data ? fmt(data) : 'skipped'
    console.log(`  ${icon} ${name.padEnd(12)} ${detail || '—'}`)
  })

  console.log(`\n⏱️  Total time: ${elapsed}s`)
  console.log('\nFull results saved to /tmp/cosmicsage_pipeline.json')

  fs.writeFileSync('/tmp/cosmicsage_pipeline.json', JSON.stringify(results, null, 2))
  return results
}

runPipeline()
