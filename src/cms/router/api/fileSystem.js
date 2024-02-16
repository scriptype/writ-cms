const express = require('express')
const api = require('../../api')

module.exports = express.Router()
  .get('/', async (req, res, next) => {
    try {
      res.status(200).json(
        await api.fileSystemExplorer.exploreTree(req.query)
      )
    } catch (e) {
      console.log('Error exploring fileSystem tree', e)
      return res.status(500).send(e)
    }
  })
