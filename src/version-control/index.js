const git = require('./git')
const Debug = require('../debug')
const Settings = require('../settings')

let repo = null

const init = async () => {
  const { revisionHistory } = Settings.getSettings()
  if (revisionHistory !== "auto") {
    return
  }
  Debug.timeStart('version control')
  await git.openRepo()
  await git.commitChanges()
  Debug.timeEnd('version control')
}

const createCache = () => {
  const { revisionHistory } = Settings.getSettings()
  if (revisionHistory === "off") {
    return {
      find: () => ({ get: () => null })
    }
  }
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
