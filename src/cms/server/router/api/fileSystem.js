const express = require('express')

module.exports = express.Router()
  .get('/', async (req, res, next) => {
    try {
      res.status(200).json(
        await req.api.fileSystemExplorer.exploreTree()
      )
    } catch (e) {
      console.log('Error exploring fileSystem tree', e)
      return res.status(500).send(e)
    }
  })
