const { join } = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const apiRouter = require('./router/api')

const createServer = ({ api }) => {
  return {
    start({ silent = false, port = 8080 }) {
      const app = express()
      app.use(express.static(join(__dirname, 'public')))
      app.use(bodyParser.json())
      app.use((req, res, next) => {
        req.api = api
        next()
      })
      app.use('/api', apiRouter)

      return app.listen(port, () => {
        if (!silent) {
          console.log('Server has started listening on port:', port)
        }
      })

    }
  }
}

module.exports = createServer
