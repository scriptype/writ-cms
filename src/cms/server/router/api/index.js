const express = require('express')

module.exports = express.Router()
  .use('/settings', require('./settings'))
  .use('/posts', require('./posts'))
  .use('/fileSystem', require('./fileSystem'))
