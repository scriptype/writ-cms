const express = require('express')
const skipWatcher = require('../../middleware/skipWatcher')

module.exports = (state) => express.Router()
  .post('/', skipWatcher(state), async (req, res) => {
    try {
      await req.api.category.create(req.body)
      state.setState(
        await req.api.ssg.build(state.getSSGOptions())
      )
      res.sendStatus(200)
    } catch (e) {
      console.log('Error creating new category', e)
      res.status(500).send(e)
    }
  })
