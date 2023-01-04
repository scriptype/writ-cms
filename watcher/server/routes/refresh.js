const writ = require('../../../')

module.exports = ({ settings }) =>
  async (req, res, next) => {
    console.log('refreshing')
    await writ(settings).compile()
    res.end()
  }
