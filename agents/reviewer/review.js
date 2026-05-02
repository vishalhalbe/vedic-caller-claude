#!/usr/bin/env node
/**
 * ╔══════════════════════════════════════════════════╗
 * ║  AGENT 5 — REVIEWER AGENT                       ║
 * ║  Deep code review of PRs: security, perf,      ║
 * ║  Agora/Razorpay best practices, and UX.        ║
 * ╚══════════════════════════════════════════════════╝
 */

import { callClaudeJSON, log } from '../shared/claude.js'
import { github } from '../shared/github.js'
import fs from 'fs'

const AGENT = 'reviewer'

const REVIEW_SYSTEM = `You are the Reviewer Agent for CosmicSage — a Vedic astrology React app.

You review code for:
1. SECURITY: No API keys exposed, Razorpay secret never in frontend, Agora token handling
2. PERFORMANCE: No memory leaks in Agora tracks, proper useEffect cleanup, no unnecessary re-renders
3. CORRECTNESS: Proper Agora track closure on unmount, Razorpay order verification, Zustand state mutations
4. UX: Loading states, error handling, empty states, mobile responsiveness
5. CODE QUALITY: DRY principle, consistent naming, proper TypeScript/PropTypes

Output JSON:
{
  "verdict": "APPROVE" | "REQUEST_CHANGES" | "COMMENT",
  "summary": string,
  "overallScore": number (0-10),
  "issues": [
    {
      "severity": "critical" | "major" | "minor" | "suggestion",
      "file": string,
      "line": number | null,
      "title": string,
      "description": string,
      "fix": string
    }
  ],
  "strengths": string[],
  "blockers": string[]
}`

async function reviewFile(filename, patch, content) {
  const result = await callClaudeJSON({
    system: REVIEW_SYSTEM,
    user: `Review this file change for CosmicSage:

File: ${filename}

Diff/Patch:
\`\`\`diff
${patch?.slice(0, 3000) || '(full file)'}
\`\`\`

Full content:
\`\`\`
${content?.slice(0, 3000) || '(not available)'}
\`\`\`

Focus on Agora RTC track lifecycle, Razorpay payment security, and React best practices.`,
    maxTokens: 2000,
  })
  return result
}

async function run() {
  const prNumber = parseInt(process.env.PR_NUMBER)
  if (!prNumber) throw new Error('PR_NUMBER env var required')

  log(AGENT, 'info', 'Starting review', { prNumber })

  // Fetch PR details and files
  const [pr, files] = await Promise.all([
    github.getPR(prNumber),
    github.getPRFiles(prNumber),
  ])

  log(AGENT, 'info', 'PR fetched', { title: pr.title, files: files.length })

  const reviewableFiles = files.filter(f =>
    (f.filename.endsWith('.jsx') || f.filename.endsWith('.js')) &&
    f.status !== 'removed' &&
    f.changes > 0
  ).slice(0, 6) // Review up to 6 files

  const fileReviews = []
  let totalScore = 0
  const allIssues = []
  const allBlockers = []

  for (const file of reviewableFiles) {
    try {
      let content = null
      try {
        const fetched = await github.getFileContent(file.filename, pr.head.sha)
        content = fetched.content
      } catch { /* skip */ }

      const review = await reviewFile(file.filename, file.patch, content)
      fileReviews.push({ file: file.filename, ...review })
      totalScore += review.overallScore || 7
      allIssues.push(...(review.issues || []).map(i => ({ ...i, file: file.filename })))
      allBlockers.push(...(review.blockers || []))
    } catch (err) {
      log(AGENT, 'warn', `Review failed for ${file.filename}: ${err.message}`)
    }
  }

  const avgScore = fileReviews.length > 0 ? (totalScore / fileReviews.length).toFixed(1) : 'N/A'
  const criticals = allIssues.filter(i => i.severity === 'critical')
  const majors = allIssues.filter(i => i.severity === 'major')
  const verdict = criticals.length > 0 ? 'REQUEST_CHANGES'
    : majors.length > 2 ? 'REQUEST_CHANGES'
    : allIssues.length === 0 ? 'APPROVE'
    : 'COMMENT'

  const scoreEmoji = avgScore >= 8 ? '🌟' : avgScore >= 6 ? '✅' : avgScore >= 4 ? '⚠️' : '❌'

  // Build review comment
  const issuesByFile = {}
  allIssues.forEach(i => {
    if (!issuesByFile[i.file]) issuesByFile[i.file] = []
    issuesByFile[i.file].push(i)
  })

  const issueMarkdown = Object.entries(issuesByFile).map(([file, issues]) => {
    const lines = issues.map(i => {
      const icon = { critical: '🔴', major: '🟠', minor: '🟡', suggestion: '💡' }[i.severity] || '•'
      return `  ${icon} **${i.title}** — ${i.description}\n    > Fix: ${i.fix}`
    }).join('\n')
    return `**\`${file}\`**\n${lines}`
  }).join('\n\n')

  const reviewBody = `## 🔮 CosmicSage Reviewer Agent

### Verdict: ${verdict === 'APPROVE' ? '✅ APPROVE' : verdict === 'REQUEST_CHANGES' ? '❌ REQUEST CHANGES' : '💬 COMMENT'}

**Overall Score:** ${scoreEmoji} ${avgScore}/10 across ${fileReviews.length} files

### Issues Found
${issueMarkdown || '✅ No issues found!'}

${allBlockers.length > 0 ? `### 🚨 Blockers\n${allBlockers.map(b => `- ${b}`).join('\n')}` : ''}

### Files Reviewed
${reviewableFiles.map(f => `- \`${f.filename}\` (${f.changes} changes)`).join('\n')}

---
*Reviewed by the CosmicSage Reviewer Agent*`

  // Post PR review
  await github.createPRReview(prNumber, reviewBody, verdict === 'APPROVE' ? 'APPROVE' : verdict === 'REQUEST_CHANGES' ? 'REQUEST_CHANGES' : 'COMMENT')
  log(AGENT, 'info', 'Review posted', { verdict, score: avgScore })

  const result = { verdict, avgScore, issueCount: allIssues.length, criticals: criticals.length, fileReviews }

  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `verdict=${verdict}\n`)
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `review_score=${avgScore}\n`)
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `critical_count=${criticals.length}\n`)
  }

  console.log(JSON.stringify(result, null, 2))
  return result
}

run().catch(err => {
  log(AGENT, 'error', err.message)
  process.exit(1)
})
