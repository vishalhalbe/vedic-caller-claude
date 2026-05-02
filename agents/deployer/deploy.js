#!/usr/bin/env node
/**
 * ╔══════════════════════════════════════════════════╗
 * ║  AGENT 6 — DEPLOYER AGENT                       ║
 * ║  Reads review verdict, test results, and        ║
 * ║  decides whether to deploy to staging/prod.    ║
 * ╚══════════════════════════════════════════════════╝
 */

import { callClaudeJSON, log } from '../shared/claude.js'
import { github } from '../shared/github.js'
import fs from 'fs'

const AGENT = 'deployer'

async function run() {
  const verdict       = process.env.REVIEW_VERDICT       || 'COMMENT'
  const reviewScore   = parseFloat(process.env.REVIEW_SCORE || '7')
  const criticalCount = parseInt(process.env.CRITICAL_COUNT || '0')
  const coverageScore = parseInt(process.env.COVERAGE_SCORE || '70')
  const testCount     = parseInt(process.env.TEST_COUNT || '0')
  const branchName    = process.env.BRANCH_NAME || 'main'
  const issueNumber   = parseInt(process.env.ISSUE_NUMBER)
  const environment   = process.env.DEPLOY_ENV || 'staging'

  log(AGENT, 'info', 'Evaluating deploy decision', {
    verdict, reviewScore, criticalCount, coverageScore, testCount, environment,
  })

  // Ask Claude to make the deployment decision
  const decision = await callClaudeJSON({
    system: `You are the Deployer Agent for CosmicSage. Decide if code is safe to deploy.
Output JSON: {
  "shouldDeploy": boolean,
  "targetEnvironment": "staging" | "production" | "none",
  "reason": string,
  "conditions": string[],
  "rollbackPlan": string,
  "releaseNotes": string
}`,
    user: `Make deployment decision:

Review verdict: ${verdict}
Review score: ${reviewScore}/10
Critical issues: ${criticalCount}
Test coverage: ${coverageScore}%
Tests generated: ${testCount}
Branch: ${branchName}
Requested environment: ${environment}

CosmicSage has Agora RTC (video calls) and Razorpay (payments) — both require high stability.
Deploy only if: no criticals, score >= 6, coverage >= 60%.`,
  })

  log(AGENT, 'info', 'Deploy decision', decision)

  // Trigger deploy workflow if approved
  if (decision.shouldDeploy && decision.targetEnvironment !== 'none') {
    try {
      await github.triggerWorkflow('deploy.yml', branchName, {
        environment: decision.targetEnvironment,
      })
      log(AGENT, 'info', `Deploy workflow triggered for ${decision.targetEnvironment}`)
    } catch (e) {
      log(AGENT, 'warn', `Could not trigger workflow: ${e.message}`)
    }
  }

  // Post deploy decision to issue
  if (issueNumber) {
    const icon = decision.shouldDeploy ? '🚀' : '🛑'
    await github.createIssueComment(issueNumber, `## ${icon} CosmicSage Deployer Agent

### Decision: ${decision.shouldDeploy ? `Deploy to **${decision.targetEnvironment}**` : '**Hold — Do Not Deploy**'}

**Reason:** ${decision.reason}

${decision.conditions.length > 0 ? `### Conditions\n${decision.conditions.map(c => `- ${c}`).join('\n')}` : ''}

### Release Notes
${decision.releaseNotes}

**Rollback Plan:** ${decision.rollbackPlan}

---
*Decision made by the CosmicSage Deployer Agent*`)
  }

  const result = { decision }

  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `should_deploy=${decision.shouldDeploy}\n`)
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `deploy_env=${decision.targetEnvironment}\n`)
  }

  console.log(JSON.stringify(result, null, 2))
  return result
}

run().catch(err => {
  log(AGENT, 'error', err.message)
  process.exit(1)
})
