const express = require('express')

module.exports = express.Router()
  .get('/', async (req, res, next) => {
    try {
      res.status(200).json(
        await req.api.contentTypes.get()
      )
    } catch (e) {
      console.log('Error getting contentTypes', e)
      return res.status(500).send(e)
    }
  })
  .post('/', async (req, res, next) => {
    try {
      res.status(200).json(
        await req.api.contentTypes.create(req.body)
      )
    } catch (e) {
      console.log('Error creating contentType', e)
      return res.status(500).send(e)
    }
  })
