const writ = require('../../../')
const { rootDirectory, debug } = require('../../../settings')
const { debugLog } = require('../../../helpers')

module.exports = (rootDirectory) =>
  async (req, res, next) => {
    debugLog('rebuilding')
    await writ.build({
      rootDirectory,
      debug
    })
    res.end()
  }
