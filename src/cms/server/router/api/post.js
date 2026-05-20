const express = require('express')

module.exports = express.Router()
  .put('/', async (req, res, next) => {
    try {
      await req.api.post.create(req.body)
      res.sendStatus(200)
    } catch (e) {
      console.log('Error creating new post', e)
      res.status(500).send(e)
    }
  })
