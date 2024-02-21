const express = require('express')

module.exports = express.Router()
  .use('/settings', require('./settings'))
  .use('/post', require('./post'))
  .use('/posts', require('./posts'))
  .use('/fileSystem', require('./fileSystem'))
