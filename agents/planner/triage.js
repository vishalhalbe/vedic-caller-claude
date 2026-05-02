#!/usr/bin/env node
/**
 * ╔══════════════════════════════════════════════╗
 * ║  AGENT 1 — TRIAGE AGENT                     ║
 * ║  Reads new GitHub issues, classifies them,  ║
 * ║  applies labels, and routes to next agent.  ║
 * ╚══════════════════════════════════════════════╝
 *
 * Inputs (env):
 *   ISSUE_NUMBER   - GitHub issue number to triage
 *   GITHUB_TOKEN   - GitHub PAT
 *   ANTHROPIC_API_KEY
 *
 * Outputs (stdout JSON):
 *   { issueNumber, type, priority, labels, routeTo, summary }
 */

import { callClaudeJSON, log } from '../shared/claude.js'
import { github } from '../shared/github.js'

const AGENT = 'triage'

const SYSTEM = `You are the Triage Agent for CosmicSage, a Vedic astrology platform.
Your job is to read a GitHub issue and produce a structured classification.

Output a JSON object with these fields:
{
  "type": one of ["bug", "feature", "enhancement", "docs", "ci", "security", "question"],
  "priority": one of ["critical", "high", "medium", "low"],
  "component": one of ["agora", "razorpay", "ui", "auth", "wallet", "astrologer", "ci", "other"],
  "labels": string[] (2-4 GitHub label names, use kebab-case),
  "routeTo": one of ["planner", "coder", "qa", "docs", "wontfix"],
  "summary": "one sentence explaining what needs to be done",
  "estimatedEffort": one of ["trivial", "small", "medium", "large"],
  "needsDiscussion": boolean
}

CosmicSage uses Agora for RTC calls and Razorpay for INR payments.`

async function run() {
  const issueNumber = parseInt(process.env.ISSUE_NUMBER)
  if (!issueNumber) throw new Error('ISSUE_NUMBER env var required')

  log(AGENT, 'info', 'Starting triage', { issueNumber })

  // Fetch issue from GitHub
  const issue = await github.getIssue(issueNumber)
  log(AGENT, 'info', 'Fetched issue', { title: issue.title })

  // Ask Claude to classify
  const classification = await callClaudeJSON({
    system: SYSTEM,
    user: `Classify this GitHub issue:

Title: ${issue.title}
Body:
${issue.body || '(no description)'}

Labels already applied: ${issue.labels.map(l => l.name).join(', ') || 'none'}`,
  })

  log(AGENT, 'info', 'Classification complete', classification)

  // Apply labels to GitHub issue
  try {
    await github.addLabels(issueNumber, [
      classification.type,
      `priority:${classification.priority}`,
      `component:${classification.component}`,
      ...classification.labels,
    ])
    log(AGENT, 'info', 'Labels applied')
  } catch (e) {
    log(AGENT, 'warn', 'Label apply failed (labels may not exist yet)', { error: e.message })
  }

  // Post triage comment to issue
  const comment = `## 🔮 CosmicSage Triage Agent

**Classification:** \`${classification.type}\` · **Priority:** \`${classification.priority}\` · **Component:** \`${classification.component}\`

**Summary:** ${classification.summary}

**Estimated Effort:** ${classification.estimatedEffort}
**Routing to:** ${classification.routeTo} agent

${classification.needsDiscussion ? '⚠️ **This issue needs team discussion before proceeding.**' : '✅ Ready for automated processing.'}

---
*Triaged automatically by the CosmicSage Multi-Agent System*`

  await github.createIssueComment(issueNumber, comment)
  log(AGENT, 'info', 'Comment posted')

  // Output for downstream agents
  const output = {
    issueNumber,
    ...classification,
    issueTitle: issue.title,
    issueBody: issue.body,
  }

  // Write to GitHub Actions output
  if (process.env.GITHUB_OUTPUT) {
    const fs = await import('fs')
    fs.appendFileSync(process.env.GITHUB_OUTPUT,
      `triage_result=${JSON.stringify(output)}\n`
    )
    fs.appendFileSync(process.env.GITHUB_OUTPUT,
      `route_to=${classification.routeTo}\n`
    )
  }

  console.log(JSON.stringify(output, null, 2))
  return output
}

run().catch(err => {
  log(AGENT, 'error', err.message)
  process.exit(1)
})
