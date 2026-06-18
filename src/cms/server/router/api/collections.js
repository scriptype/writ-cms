const express = require('express')
const skipWatcher = require('../../middleware/skipWatcher')

module.exports = (state) => express.Router()
  .get('/', async (req, res) => {
    try {
      res.status(200).json(
        await req.api.collections.get()
      )
    } catch (e) {
      console.log('Error getting collections', e)
      return res.status(500).send(e)
    }
  })
  .post('/', skipWatcher(state), async (req, res) => {
    try {
      await req.api.collections.create(req.body)
      state.setState(
        await req.api.ssg.build(state.getSSGOptions())
      )
      res.sendStatus(200)
    } catch (e) {
      console.log('Error creating new collection', e)
      res.status(500).send(e)
    }
  })
