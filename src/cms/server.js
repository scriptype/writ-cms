const { join } = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const api = require('./api')

const port = 8080

const init = () => {
  const app = express()

  app.use(express.static(join(__dirname, 'public')))
  app.use(bodyParser.json())
  app.use('/api', api)

  app.listen(port, () => {
    console.log('Server has started listening on port:', port)
  })
}

module.exports = {
  init
}
