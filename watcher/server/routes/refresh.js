const writ = require('../../../')
const { rootDirectory } = require('../../../settings')

module.exports = (rootDirectory) =>
  async (req, res, next) => {
    console.log('refreshing')
    await writ.build(rootDirectory)
    res.end()
  }
