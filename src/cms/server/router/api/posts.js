const express = require('express')

module.exports = express.Router()
  .get('/', async (req, res, next) => {
    try {
      res.status(200).json(
        await req.api.posts.get(req.body)
      )
    } catch (e) {
      console.log('Error getting posts', e)
      return res.status(500).send(e)
    }
  })
