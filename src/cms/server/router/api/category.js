const express = require('express')

module.exports = express.Router()
  .put('/', async (req, res) => {
    try {
      await req.api.category.create(req.body)
      res.sendStatus(200)
    } catch (e) {
      console.log('Error creating new category', e)
      res.status(500).send(e)
    }
  })
