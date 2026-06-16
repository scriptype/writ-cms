const express = require('express')

module.exports = (state) => express.Router()
  .post('/', async (req, res) => {
    try {
      await req.api.post.create(req.body)
      res.sendStatus(200)
    } catch (e) {
      console.log('Error creating new post', e)
      res.status(500).send(e)
    }
  })
  .put('/', async (req, res) => {
    try {
      state.skipWatcherBuild()
      const response = await req.api.post.update(req.body)
      const ssgOptions = await state.getSSGOptions()
      state.setState(await req.api.ssg.build(ssgOptions))
      res.status(200).send(response)
    } catch (e) {
      console.log('Error updating post', e)
      res.status(500).send(e)
    } finally {
      setTimeout(() => {
        state.unskipWatcherBuild()
      }, 500)
    }
  })
