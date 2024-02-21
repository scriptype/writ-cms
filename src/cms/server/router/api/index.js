const express = require('express')

module.exports = express.Router()
  .use('/settings', require('./settings'))
  .use('/fileSystemTree', require('./fileSystemTree'))
  .use('/contentModel', require('./contentModel'))
  .use('/categories', require('./categories'))
  .use('/category', require('./category'))
  .use('/posts', require('./posts'))
  .use('/post', require('./post'))
  .use('/subpages', require('./subpages'))
  .use('/subpage', require('./subpage'))