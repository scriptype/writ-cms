const express = require('express')

module.exports = express.Router()
  .get('/', async (req, res, next) => {
    const pageTitle = decodeURI(req.query.title)
    try {
      res.status(200).json(
        await req.api.homepage.get()
      )
    } catch (e) {
      console.log('Error getting homepage', e)
      return res.status(500).send(e)
    }
  })
  .put('/', async (req, res, next) => {
    try {
      await req.api.homepage.create(req.body)
      res.sendStatus(200)
    } catch (e) {
      console.log('Error creating new homepage', e)
      res.status(500).send(e)
    }
  })
