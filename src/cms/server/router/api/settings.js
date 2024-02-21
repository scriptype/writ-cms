const express = require('express')

module.exports = express.Router()
  .get('/', async (req, res, next) => {
    try {
      res.status(200).json(
        await req.api.settings.get()
      )
    } catch (e) {
      console.log('Error getting settings', e)
      return res.status(500).send(e)
    }
  })
  .post('/', async (req, res, next) => {
    try {
      await req.api.settings.update(req.body)
      res.sendStatus(200)
    } catch (e) {
      console.log('Error updating settings', e)
      res.status(500).send(e)
    }
  })
