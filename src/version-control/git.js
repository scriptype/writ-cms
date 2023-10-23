const { resolve } = require('path')
const { exec, execSync } = require('child_process')
const Debug = require('../debug')
const Settings = require('../settings')

const init = () => {
  const { rootDirectory } = Settings.getSettings()
  try {
    execSync('git init', { cwd: resolve(rootDirectory) })
    Debug.debugLog('git.init has run without errors')
  } catch (initError) {
    Debug.debugLog('git.init error', initError.message)
  }
}

const hasInitialized = () => {
  const { rootDirectory } = Settings.getSettings()
  try {
    execSync('git status', { cwd: resolve(rootDirectory) })
    Debug.debugLog('git.hasInitialized has run without errors')
  } catch (statusError) {
    if (statusError.message.match('fatal: not a git repository')) {
      return false
    } else {
      Debug.debugLog('git.hasInitialized error', statusError.message)
    }
  }
  return true
}

const hasUncheckedFiles = () => {
  const { rootDirectory } = Settings.getSettings()
  try {
    const output = execSync('git status', { cwd: resolve(rootDirectory) }).toString()
    const hasUntracked = output.match('Untracked files:')
    const hasUnchecked = output.match('Changes not staged for commit')
    if (hasUntracked || hasUnchecked) {
      return true
    }
    Debug.debugLog('git.hasUncheckedFiles has run without errors')
  } catch (statusError) {
    Debug.debugLog('git.hasUncheckedFiles error', statusError.message)
  }
  return false
}

const commit = (message) => {
  const { rootDirectory } = Settings.getSettings()
  const commitMessage = message || 'Check-in changes'
  try {
    execSync(`git add -A && git commit -m "${commitMessage}"`, { cwd: resolve(rootDirectory) })
    Debug.debugLog('git.commit has run without errors')
  } catch (commitError) {
    Debug.debugLog('git.commit error', commitError.message)
  }
}

const getRevisionHistory = (path) => {
  const { rootDirectory } = Settings.getSettings()
  let result = ''
  try {
    result = execSync(`git log --follow "${path}"`, { cwd: resolve(rootDirectory) }).toString().trim()
  } catch (e) {
    Debug.debugLog('Error in git.getRevisionHistory')
    return null
  }
  if (!result.trim()) {
    return null
  }
  return result.split('commit ').map(commit => {
    const lines = commit.split('\n').map(l => l.trim()).filter(Boolean)
    if (!lines[2]) {
      return ''
    }
    const hash = lines[0]
    
    const [ authorName, authorEmail ] = lines[1].replace(/Author:\s+/, '').split(' ')
    const date = lines[2].replace(/Date:\s+/, '')
    const message = lines.slice(3).join('\n').trim()
    return {
      hash,
      author: {
        name: authorName,
        email: authorEmail
      },
      date,
      message
    }
  })
}

module.exports = {
  init,
  hasInitialized,
  hasUncheckedFiles,
  commit,
  getRevisionHistory
}
