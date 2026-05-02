/**
 * CosmicSage Multi-Agent System
 * Shared Claude API client used by all agents
 */

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-opus-4-5-20251101'

/**
 * Call Claude with a system prompt and user message.
 * Returns the full text response.
 */
export async function callClaude({ system, user, maxTokens = 4096, tools = [] }) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY is not set')

  const body = {
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content: user }],
  }
  if (tools.length > 0) body.tools = tools

  const res = await fetch(ANTHROPIC_API, {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Claude API ${res.status}: ${err}`)
  }

  const data = await res.json()
  // Extract text blocks
  return data.content
    .filter(b => b.type === 'text')
    .map(b => b.text)
    .join('\n')
}

/**
 * Call Claude expecting a JSON response.
 * Automatically strips markdown fences.
 */
export async function callClaudeJSON({ system, user, maxTokens = 2048 }) {
  const raw = await callClaude({
    system: system + '\n\nRespond ONLY with valid JSON. No markdown, no explanation.',
    user,
    maxTokens,
  })
  const cleaned = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  return JSON.parse(cleaned)
}

/**
 * Structured log helper
 */
export function log(agent, level, message, data = {}) {
  const entry = {
    ts: new Date().toISOString(),
    agent,
    level,
    message,
    ...data,
  }
  console.log(JSON.stringify(entry))
}
