const express = require('express')

module.exports = express.Router()
  .get('/*', async (req, res, next) => {
    const categoryName = decodeURI(req.path)
    try {
      res.status(200).json(
        await req.api.category.get(categoryName)
      )
    } catch (e) {
      console.log('Error getting category', e)
      return res.status(500).send(e)
    }
  })
  .put('/', async (req, res, next) => {
    try {
      await req.api.category.create(req.body)
      res.sendStatus(200)
    } catch (e) {
      console.log('Error creating new category', e)
      res.status(500).send(e)
    }
  })
