const git = require('./git')
const Debug = require('../debug')
const Settings = require('../settings')
const createDecorator = require('./decorator')

const State = {
  repo: null
}

const Methods = (() => {
  const init = async () => {
    const { revisionHistory } = Settings.getSettings()
    Debug.timeStart('version control')
    if (revisionHistory !== "auto") {
      Debug.timeEnd('version control')
      return
    }
    State.repo = await git.openRepo()
    await git.commitChanges()
    Debug.timeEnd('version control')
  }

  const getFileHistory = async (path) => {
    if (Settings.getSettings().revisionHistory === "off") {
      return null
    }
    try {
      const history = await git.getRevisionHistory(path)
    } catch (e) {
      Debug.debugLog('error getting revision history of file', path, e)
      return null
    }
  }

  return {
    init,
    getFileHistory
  }
})()


module.exports = {
  ...Methods,
  decorator: createDecorator(State, Methods)
}
