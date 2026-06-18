const express = require('express')
const skipWatcher = require('../../middleware/skipWatcher')

module.exports = (state) => express.Router()
  .get('/', async (req, res) => {
    try {
      res.status(200).json(
        await req.api.homepage.get()
      )
    } catch (e) {
      console.log('Error getting homepage', e)
      return res.status(500).send(e)
    }
  })
  .post('/', skipWatcher(state), async (req, res) => {
    try {
      await req.api.homepage.create(req.body)
      state.setState(
        await req.api.ssg.build(state.getSSGOptions())
      )
      res.sendStatus(200)
    } catch (e) {
      console.log('Error creating homepage', e)
      res.status(500).send(e)
    }
  })
  .put('/', skipWatcher(state), async (req, res) => {
    try {
      const response = await req.api.homepage.update(req.body)
      state.setState(
        await req.api.ssg.build(state.getSSGOptions())
      )
      res.status(200).send(response)
    } catch (e) {
      console.log('Error updating homepage', e)
      res.status(500).send(e)
    }
  })
