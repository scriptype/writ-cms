const express = require('express')

module.exports = express.Router()
  .use('/settings', require('./settings'))
  .use('/fileSystemTree', require('./fileSystemTree'))
  .use('/contentModel', require('./contentModel'))
  .use('/category', require('./category'))
  .use('/post', require('./post'))
  .use('/posts', require('./posts'))
