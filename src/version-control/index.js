const git = require('./git')
const Debug = require('../debug')

const init = () => {
  Debug.timeStart('version control')
  if (!git.hasInitialized()) {
    git.init()
  }
  if (git.hasUncheckedFiles()) {
    git.commit()
  }
  Debug.timeEnd('version control')
}

const createCache = () => {
  return {
    find(path) {
      const revisionHistory = git.getRevisionHistory(path)

      return {
        get(key) {
          if (!revisionHistory) {
            return null
          }
          const firstEntry = revisionHistory[revisionHistory.length - 1]
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
