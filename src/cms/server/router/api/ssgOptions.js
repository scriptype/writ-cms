const express = require('express')

module.exports = express.Router()
  .get('/', async (req, res, next) => {
    try {
      res.status(200).json(
        await req.api.ssgOptions.get()
      )
    } catch (e) {
      console.log('Error getting ssgOptions', e)
      return res.status(500).send(e)
    }
  })
