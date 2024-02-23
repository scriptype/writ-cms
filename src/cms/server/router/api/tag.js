const express = require('express')

module.exports = express.Router()
  .get('/', async (req, res, next) => {
    const tag = decodeURI(req.query.tag)
    try {
      res.status(200).json(
        await req.api.tag.get(tag)
      )
    } catch (e) {
      console.log('Error getting tag', e)
      return res.status(500).send(e)
    }
  })
