const express = require('express')

module.exports = express.Router()
  .get('/', async (req, res) => {
    try {
      res.status(200).json(
        await req.api.homepage.get()
      )
    } catch (e) {
      console.log('Error getting homepage', e)
      return res.status(500).send(e)
    }
  })
  .post('/', async (req, res) => {
    try {
      await req.api.homepage.create(req.body)
      res.sendStatus(200)
    } catch (e) {
      console.log('Error creating homepage', e)
      res.status(500).send(e)
    }
  })
  .put('/', async (req, res) => {
    try {
      await req.api.homepage.update(req.body)
      res.sendStatus(200)
    } catch (e) {
      console.log('Error updating homepage', e)
      res.status(500).send(e)
    }
  })
