const express = require('express')

module.exports = express.Router()
  .get('/', async (req, res, next) => {
    try {
      res.status(200).json(
        await req.api.workspace.get()
      )
    } catch (e) {
      console.log('Error running workspace.get', e)
      res.status(500).send(e)
    }
  })
  .post('/', async (req, res, next) => {
    try {
      res.status(200).json(
        await req.api.workspace.create()
      )
    } catch (e) {
      console.log('Error running workspace.create', e)
      res.status(500).send(e)
    }
  })
  .post('/project', async (req, res, next) => {
    try {
      res.status(200).json(
        await req.api.workspace.createProject(req.body)
      )
    } catch (e) {
      console.log('Error running workspace.createProject', e)
      res.status(500).send(e)
    }
  })
