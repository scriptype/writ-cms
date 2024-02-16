const express = require('express')
const { fileSystem } = require('../../api')

module.exports = express.Router()
  .get('/', async (req, res, next) => {
    try {
      res.status(200).json(
        await fileSystem.exploreTree(req.query)
      )
    } catch (e) {
      console.log('Error exploring fileSystem tree', e)
      return res.status(500).send(e)
    }
  })
