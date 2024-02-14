const { join } = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const apiRouter = require('./router/api')

const port = 8080

const init = () => {
  const app = express()

  app.use(express.static(join(__dirname, 'public')))
  app.use(bodyParser.json())
  app.use('/api', apiRouter)

  app.listen(0, () => {
    console.log('Server has started listening on port:', port)
  })
}

module.exports = {
  init
}
