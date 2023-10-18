const git = require('./git')

const init = () => {}

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
