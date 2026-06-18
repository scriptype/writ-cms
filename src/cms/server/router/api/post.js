const express = require('express')
const skipWatcher = require('../../middleware/skipWatcher')

module.exports = (state) => express.Router()
  .post('/', skipWatcher(state), async (req, res) => {
    try {
      await req.api.post.create(req.body)
      state.setState(
        await req.api.ssg.build(state.getSSGOptions())
      )
      res.sendStatus(200)
    } catch (e) {
      console.log('Error creating new post', e)
      res.status(500).send(e)
    }
  })
  .put('/', skipWatcher(state), async (req, res) => {
    try {
      const response = await req.api.post.update(req.body)
      state.setState(
        await req.api.ssg.build(state.getSSGOptions())
      )
      res.status(200).send(response)
    } catch (e) {
      console.log('Error updating post', e)
      res.status(500).send(e)
    }
  })
