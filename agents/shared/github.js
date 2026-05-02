/**
 * CosmicSage Multi-Agent System
 * GitHub REST API client shared across all agents
 */

const BASE = 'https://api.github.com'

function headers() {
  const token = process.env.GITHUB_TOKEN
  if (!token) throw new Error('GITHUB_TOKEN is not set')
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    Accept: 'application/vnd.github.v3+json',
    'X-GitHub-Api-Version': '2022-11-28',
  }
}

async function ghFetch(path, options = {}) {
  const url = path.startsWith('http') ? path : `${BASE}${path}`
  const res = await fetch(url, { ...options, headers: { ...headers(), ...options.headers } })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`GitHub API ${res.status} ${path}: ${body}`)
  }
  return res.status === 204 ? null : res.json()
}

const OWNER = process.env.GITHUB_REPOSITORY_OWNER || 'vishalhalbe'
const REPO  = process.env.GITHUB_REPOSITORY?.split('/')[1] || 'vedic-caller-claude'

export const github = {
  // ── Issues ──────────────────────────────────────────
  getIssue: (number) => ghFetch(`/repos/${OWNER}/${REPO}/issues/${number}`),

  listIssues: (state = 'open') =>
    ghFetch(`/repos/${OWNER}/${REPO}/issues?state=${state}&per_page=50`),

  createIssueComment: (number, body) =>
    ghFetch(`/repos/${OWNER}/${REPO}/issues/${number}/comments`, {
      method: 'POST',
      body: JSON.stringify({ body }),
    }),

  addLabels: (number, labels) =>
    ghFetch(`/repos/${OWNER}/${REPO}/issues/${number}/labels`, {
      method: 'POST',
      body: JSON.stringify({ labels }),
    }),

  createLabel: (name, color, description) =>
    ghFetch(`/repos/${OWNER}/${REPO}/labels`, {
      method: 'POST',
      body: JSON.stringify({ name, color, description }),
    }),

  // ── Pull Requests ────────────────────────────────────
  getPR: (number) => ghFetch(`/repos/${OWNER}/${REPO}/pulls/${number}`),

  listPRs: (state = 'open') =>
    ghFetch(`/repos/${OWNER}/${REPO}/pulls?state=${state}&per_page=20`),

  getPRFiles: (number) =>
    ghFetch(`/repos/${OWNER}/${REPO}/pulls/${number}/files`),

  createPRReview: (number, body, event = 'COMMENT') =>
    ghFetch(`/repos/${OWNER}/${REPO}/pulls/${number}/reviews`, {
      method: 'POST',
      body: JSON.stringify({ body, event }),
    }),

  createPRComment: (number, body, commitId, path, line) =>
    ghFetch(`/repos/${OWNER}/${REPO}/pulls/${number}/comments`, {
      method: 'POST',
      body: JSON.stringify({ body, commit_id: commitId, path, line }),
    }),

  // ── Branches & Commits ──────────────────────────────
  getBranch: (branch) => ghFetch(`/repos/${OWNER}/${REPO}/branches/${branch}`),

  listBranches: () => ghFetch(`/repos/${OWNER}/${REPO}/branches`),

  getCommit: (sha) => ghFetch(`/repos/${OWNER}/${REPO}/commits/${sha}`),

  getFileContent: async (path, ref = 'main') => {
    const data = await ghFetch(`/repos/${OWNER}/${REPO}/contents/${path}?ref=${ref}`)
    return {
      content: Buffer.from(data.content, 'base64').toString('utf-8'),
      sha: data.sha,
    }
  },

  createOrUpdateFile: (path, message, content, sha = undefined, branch = 'main') =>
    ghFetch(`/repos/${OWNER}/${REPO}/contents/${path}`, {
      method: 'PUT',
      body: JSON.stringify({
        message,
        content: Buffer.from(content).toString('base64'),
        sha,
        branch,
      }),
    }),

  // ── Workflow Runs ────────────────────────────────────
  triggerWorkflow: (workflowId, ref, inputs = {}) =>
    ghFetch(`/repos/${OWNER}/${REPO}/actions/workflows/${workflowId}/dispatches`, {
      method: 'POST',
      body: JSON.stringify({ ref, inputs }),
    }),

  // ── Repository ───────────────────────────────────────
  getRepo: () => ghFetch(`/repos/${OWNER}/${REPO}`),

  createRelease: (tag, name, body, prerelease = false) =>
    ghFetch(`/repos/${OWNER}/${REPO}/releases`, {
      method: 'POST',
      body: JSON.stringify({ tag_name: tag, name, body, prerelease }),
    }),
}

export { OWNER, REPO }
