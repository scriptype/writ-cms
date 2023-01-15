const writ = require('../../../')
const { rootDirectory } = require('../../../settings')
const Debug = require('../../../debug')

module.exports = (rootDirectory) =>
  async (req, res, next) => {
    Debug.debugLog('rebuilding')
    await writ.build({
      rootDirectory,
      debug: Debug.getDebug()
    })
    res.end()
  }
