const express = require('express')

module.exports = express.Router()
  .post('/build', async (req, res, next) => {
    try {
      await req.api.ssg.build({
        mode: req.body.mode,
        rootDirectory: req.body.rootDirectory,
        refreshTheme: req.body.refreshTheme,
        debug: req.body.debug,
        cli: req.body.cli
      })
      res.sendStatus(200)
    } catch (e) {
      console.log('Error running ssg.build', e)
      res.status(500).send(e)
    }
  })
  .post('/watch', async (req, res, next) => {
    try {
      await req.api.ssg.watch({
        mode: req.body.mode,
        rootDirectory: req.body.rootDirectory,
        refreshTheme: req.body.refreshTheme,
        debug: req.body.debug,
        cli: req.body.cli
      })
      res.sendStatus(200)
    } catch (e) {
      console.log('Error running ssg.watch', e)
      res.status(500).send(e)
    }
  })
  .post('/stop-watcher', async (req, res, next) => {
    try {
      await req.api.ssg.stopWatcher()
      res.sendStatus(200)
    } catch (e) {
      console.log('Error running ssg.stopWatcher', e)
      res.status(500).send(e)
    }
  })
