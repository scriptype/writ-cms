const express = require('express')

module.exports = express.Router()
  .post('/', async (req, res) => {
    try {
      await req.api.post.create(req.body)
      res.sendStatus(200)
    } catch (e) {
      console.log('Error creating new post', e)
      res.status(500).send(e)
    }
  })
  .put('/', async (req, res) => {
    try {
      await req.api.post.edit(req.body)
      res.sendStatus(200)
    } catch (e) {
      console.log('Error updating post', e)
      res.status(500).send(e)
    }
  })
