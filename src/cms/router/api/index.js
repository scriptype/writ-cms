const express = require('express')

module.exports = express.Router()
  .use('/posts', require('./posts'))
