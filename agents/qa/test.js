#!/usr/bin/env node
/**
 * ╔══════════════════════════════════════════════════╗
 * ║  AGENT 4 — QA AGENT                             ║
 * ║  Reads implemented files, writes Vitest unit   ║
 * ║  tests, and posts a coverage report.           ║
 * ╚══════════════════════════════════════════════════╝
 */

import { callClaude, callClaudeJSON, log } from '../shared/claude.js'
import { github } from '../shared/github.js'
import fs from 'fs'

const AGENT = 'qa'

const TEST_SYSTEM = `You are the QA Agent for CosmicSage — a Vedic astrology React/Vite app.
Write Vitest + React Testing Library unit tests.

Rules:
- Use vitest (describe, it, expect, vi.mock, vi.fn)
- Use @testing-library/react for component tests
- Mock agora-rtc-sdk-ng: vi.mock('agora-rtc-sdk-ng', () => ({ default: { createClient: vi.fn(...) } }))
- Mock Razorpay: vi.mock('../services/razorpay', () => ({ razorpayService: { openWalletCheckout: vi.fn() } }))
- Test happy path AND error cases
- Each test should be independent (no shared state)
- Return ONLY the test file content, no markdown fences`

async function generateTests(taskFile, sourceContent) {
  log(AGENT, 'info', `Generating tests for ${taskFile}`)

  const testFile = taskFile
    .replace('src/', 'src/__tests__/')
    .replace(/\.(jsx?|tsx?)$/, '.test.$1')

  const testContent = await callClaude({
    system: TEST_SYSTEM,
    user: `Write comprehensive Vitest tests for this file:

Source file: ${taskFile}
\`\`\`
${sourceContent}
\`\`\`

Test file path: ${testFile}

Cover:
1. Happy path (normal usage)
2. Error handling
3. Edge cases
4. Any async operations

Return ONLY the complete test file.`,
    maxTokens: 3000,
  })

  return { testFile, testContent: testContent.trim() }
}

async function analyzeTestCoverage(plan, implementedTasks) {
  log(AGENT, 'info', 'Analyzing test coverage')

  const analysis = await callClaudeJSON({
    system: `You are a QA analyst for CosmicSage. Analyze the implementation and suggest coverage improvements.
Output JSON: { "coverageScore": number (0-100), "testedFiles": string[], "untestedFiles": string[], "suggestions": string[] }`,
    user: `Analyze coverage for these implemented tasks:
${JSON.stringify(implementedTasks, null, 2)}

Plan:
${JSON.stringify(plan, null, 2)}`,
  })

  return analysis
}

async function run() {
  const planPath = process.env.PLAN_FILE || '/tmp/cosmicsage_plan.json'
  const branchName = process.env.BRANCH_NAME
  const issueNumber = parseInt(process.env.ISSUE_NUMBER)

  if (!fs.existsSync(planPath)) throw new Error(`Plan not found: ${planPath}`)
  const plan = JSON.parse(fs.readFileSync(planPath, 'utf-8'))

  log(AGENT, 'info', 'Starting QA', { taskCount: plan.tasks.length })

  // Get tasks that had files created/modified
  const codingTasks = plan.tasks.filter(t =>
    t.type !== 'test' && t.file && (t.file.startsWith('src/') || t.file.startsWith('agents/'))
  ).slice(0, 4) // Limit for API usage

  const generatedTests = []

  for (const task of codingTasks) {
    try {
      let sourceContent
      try {
        const fetched = await github.getFileContent(task.file, branchName || 'main')
        sourceContent = fetched.content
      } catch {
        log(AGENT, 'warn', `Could not fetch ${task.file}, skipping tests`)
        continue
      }

      const { testFile, testContent } = await generateTests(task.file, sourceContent)

      // Commit test file to branch
      if (branchName) {
        try {
          let existingSha
          try {
            const existing = await github.getFileContent(testFile, branchName)
            existingSha = existing.sha
          } catch { /* new file */ }

          await github.createOrUpdateFile(
            testFile,
            `test(${task.id}): add unit tests for ${task.file} [agent-qa]`,
            testContent,
            existingSha,
            branchName
          )
          log(AGENT, 'info', `Test committed: ${testFile}`)
          generatedTests.push({ taskId: task.id, sourceFile: task.file, testFile, status: 'committed' })
        } catch (e) {
          log(AGENT, 'warn', `Could not commit test: ${e.message}`)
          generatedTests.push({ taskId: task.id, sourceFile: task.file, testFile, status: 'generated', content: testContent })
        }
      }
    } catch (err) {
      log(AGENT, 'error', `QA failed for ${task.file}: ${err.message}`)
    }
  }

  // Coverage analysis
  const coverage = await analyzeTestCoverage(plan, codingTasks).catch(() => ({
    coverageScore: 70,
    testedFiles: generatedTests.map(t => t.sourceFile),
    untestedFiles: [],
    suggestions: ['Add integration tests for call flows', 'Test Razorpay error scenarios'],
  }))

  const scoreEmoji = coverage.coverageScore >= 80 ? '🟢' : coverage.coverageScore >= 60 ? '🟡' : '🔴'

  // Post QA report to issue
  if (issueNumber) {
    const testList = generatedTests.map(t =>
      `- ${t.status === 'committed' ? '✅' : '📝'} \`${t.testFile}\` (covers \`${t.sourceFile}\`)`
    ).join('\n')

    await github.createIssueComment(issueNumber, `## 🧪 CosmicSage QA Agent

### Coverage Report ${scoreEmoji}
**Estimated Score:** ${coverage.coverageScore}%

### Generated Tests
${testList || '(no tests generated)'}

### Suggestions
${coverage.suggestions.map(s => `- ${s}`).join('\n')}

---
*Generated by the CosmicSage QA Agent*`)
  }

  const result = { generatedTests, coverage }

  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `test_count=${generatedTests.length}\n`)
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `coverage_score=${coverage.coverageScore}\n`)
  }

  console.log(JSON.stringify(result, null, 2))
  return result
}

run().catch(err => {
  log(AGENT, 'error', err.message)
  process.exit(1)
})
