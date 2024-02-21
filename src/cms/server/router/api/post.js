const express = require('express')

module.exports = express.Router()
  .get('/', async (req, res, next) => {
    const postHandle = decodeURI(req.query.handle)
    try {
      res.status(200).json(
        await req.api.post.get(postHandle)
      )
    } catch (e) {
      console.log('Error getting post', e)
      return res.status(500).send(e)
    }
  })
  .put('/', async (req, res, next) => {
    try {
      await req.api.post.create(req.body)
      res.sendStatus(200)
    } catch (e) {
      console.log('Error creating new post', e)
      res.status(500).send(e)
    }
  })
