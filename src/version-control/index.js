const git = require('./git')
const Debug = require('../debug')

let repo = null

const init = async () => {
  Debug.timeStart('version control')
  repo = await git.openRepo()
  await git.commitChanges(repo)
  Debug.timeEnd('version control')
}

const createCache = () => {
  return {
    async find(path) {
      let fileRevisionHistory = null
      try {
        fileRevisionHistory = await git.getRevisionHistory(path)
      }
      catch (e) {
        Debug.debugLog('error getting revision history of file', path, e)
      }
      return {
        get(key) {
          if (!fileRevisionHistory) {
            return null
          }
          const firstEntry = fileRevisionHistory[fileRevisionHistory.length - 1]
          return firstEntry[key] || null
        }
      }
    }
  }
}

module.exports = {
  init,
  createCache
}
