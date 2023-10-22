const { execSync } = require('child_process')
const Debug = require('../debug')

const getRevisionHistory = (path) => {
  let result = ''
  try {
    result = execSync(`git log --follow "${path}"`).toString().trim()
  } catch (e) {
    Debug.debugLog('Error in getRevisionHistory')
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
  getRevisionHistory
}
