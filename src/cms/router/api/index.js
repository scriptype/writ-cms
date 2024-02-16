const express = require('express')

module.exports = express.Router()
  .use('/posts', require('./posts'))
  .use('/fileSystem', require('./fileSystem'))
