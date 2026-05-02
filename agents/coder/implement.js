#!/usr/bin/env node
/**
 * ╔══════════════════════════════════════════════════╗
 * ║  AGENT 3 — CODER AGENT                          ║
 * ║  Reads the plan, fetches relevant files, asks  ║
 * ║  Claude to implement each task, commits to a   ║
 * ║  feature branch, and opens a PR.               ║
 * ╚══════════════════════════════════════════════════╝
 */

import { callClaude, log } from '../shared/claude.js'
import { github } from '../shared/github.js'
import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

const AGENT = 'coder'

const SYSTEM = `You are the Coder Agent for CosmicSage — a Vedic astrology React/Vite app.

Tech rules:
- React 18 functional components, hooks only (no class components)
- Tailwind CSS via className (use cosmic-card, btn-primary, btn-gold, input-cosmic, text-gradient CSS classes)
- Zustand for state (useAuthStore, useWalletStore, useCallStore, useAstrologerStore from src/store/index.js)
- Agora via agoraService from src/services/agora.js and useAgoraCall hook
- Razorpay via razorpayService from src/services/razorpay.js and useRazorpay hook
- lucide-react for icons
- react-hot-toast for notifications
- framer-motion for animations
- Imports use relative paths (no @ aliases in components)

When implementing code:
1. Return ONLY the complete file content
2. No markdown fences, no explanation
3. Include all existing code plus your changes
4. Keep the cosmic dark theme (bg-cosmic-950, text-stardust, etc)`

async function getFileContent(filePath) {
  try {
    const { content } = await github.getFileContent(filePath)
    return content
  } catch {
    return null // File doesn't exist yet
  }
}

async function implementTask(task, existingContent) {
  log(AGENT, 'info', `Implementing task ${task.id}`, { file: task.file, type: task.type })

  if (task.type === 'delete') {
    return null // Signal deletion
  }

  const prompt = `Implement this task for CosmicSage:

Task ID: ${task.id}
Title: ${task.title}
Type: ${task.type}
File: ${task.file}
Description: ${task.description}

Acceptance criteria:
${task.acceptanceCriteria.map((c, i) => `${i + 1}. ${c}`).join('\n')}

${existingContent
  ? `CURRENT FILE CONTENT (modify this):\n\`\`\`\n${existingContent}\n\`\`\``
  : 'This is a NEW file — create it from scratch.'
}

Return ONLY the complete file content. No markdown, no explanation.`

  const code = await callClaude({ system: SYSTEM, user: prompt, maxTokens: 4096 })
  return code.trim()
}

async function run() {
  const planPath = process.env.PLAN_FILE || '/tmp/cosmicsage_plan.json'
  const issueNumber = parseInt(process.env.ISSUE_NUMBER)
  const maxTasks = parseInt(process.env.MAX_TASKS) || 5 // Safety limit

  if (!fs.existsSync(planPath)) throw new Error(`Plan file not found: ${planPath}`)

  const plan = JSON.parse(fs.readFileSync(planPath, 'utf-8'))
  log(AGENT, 'info', 'Starting coding', { planTitle: plan.planTitle, taskCount: plan.tasks.length })

  // Create feature branch name
  const branchName = `agent/issue-${issueNumber}-${Date.now()}`
  const implementedTasks = []
  const failedTasks = []

  // Process tasks up to limit (avoid runaway API usage)
  const tasksToRun = plan.tasks
    .filter(t => t.type !== 'test') // QA agent handles tests
    .slice(0, maxTasks)

  for (const task of tasksToRun) {
    try {
      const existing = await getFileContent(task.file)
      const newContent = await implementTask(task, existing)

      if (newContent === null && task.type === 'delete') {
        log(AGENT, 'info', `Skipping delete task (manual): ${task.file}`)
        continue
      }

      // Write to temp location
      const tmpFile = `/tmp/cosmicsage_task_${task.id}.txt`
      fs.writeFileSync(tmpFile, newContent)

      // Commit via GitHub API
      try {
        const fileSha = existing ? (await github.getFileContent(task.file)).sha : undefined
        await github.createOrUpdateFile(
          task.file,
          `feat(${task.id}): ${task.title} [agent-coder]`,
          newContent,
          fileSha,
          branchName
        )
        implementedTasks.push({ ...task, status: 'done' })
        log(AGENT, 'info', `Task ${task.id} committed`, { file: task.file })
      } catch (commitErr) {
        // Branch might not exist yet — create it first
        if (commitErr.message.includes('422')) {
          log(AGENT, 'warn', 'Branch not found, creating...', { branchName })
          // Get main SHA
          const mainBranch = await github.getBranch('main')
          await fetch(`https://api.github.com/repos/${process.env.GITHUB_REPOSITORY}/git/refs`, {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              ref: `refs/heads/${branchName}`,
              sha: mainBranch.commit.sha,
            }),
          })
          // Retry commit
          await github.createOrUpdateFile(
            task.file,
            `feat(${task.id}): ${task.title} [agent-coder]`,
            newContent,
            undefined,
            branchName
          )
          implementedTasks.push({ ...task, status: 'done' })
        } else {
          throw commitErr
        }
      }
    } catch (err) {
      log(AGENT, 'error', `Task ${task.id} failed: ${err.message}`)
      failedTasks.push({ ...task, error: err.message })
    }
  }

  // Post coding summary to issue
  if (issueNumber) {
    const doneList = implementedTasks.map(t => `- ✅ \`${t.id}\` ${t.title} → \`${t.file}\``).join('\n')
    const failList = failedTasks.map(t => `- ❌ \`${t.id}\` ${t.title}: ${t.error}`).join('\n')

    await github.createIssueComment(issueNumber, `## 💻 CosmicSage Coder Agent

**Branch:** \`${branchName}\`

### Implemented
${doneList || '(none)'}

${failList ? `### Failed\n${failList}` : ''}

**Next step:** QA Agent will write tests, then Reviewer Agent will audit the PR.

---
*Implemented by the CosmicSage Coder Agent*`)
  }

  const result = { branchName, implementedTasks, failedTasks }

  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `branch_name=${branchName}\n`)
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `implemented_count=${implementedTasks.length}\n`)
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `failed_count=${failedTasks.length}\n`)
  }

  console.log(JSON.stringify(result, null, 2))
  return result
}

run().catch(err => {
  log(AGENT, 'error', err.message)
  process.exit(1)
})
