const express = require('express')
const skipWatcher = require('../../middleware/skipWatcher')

module.exports = (state) => express.Router()
  .get('/', async (req, res) => {
    const pageTitle = decodeURI(req.query.title)
    try {
      res.status(200).json(
        await req.api.subpage.get(pageTitle)
      )
    } catch (e) {
      console.log('Error getting subpage', e)
      return res.status(500).send(e)
    }
  })
  .post('/', skipWatcher(state), async (req, res) => {
    try {
      await req.api.subpage.create(req.body)
      state.setState(
        await req.api.ssg.build(state.getSSGOptions())
      )
      res.sendStatus(200)
    } catch (e) {
      console.log('Error creating new subpage', e)
      res.status(500).send(e)
    }
  })
  .put('/', skipWatcher(state), async (req, res) => {
    try {
      const response = await req.api.subpage.update(req.body)
      state.setState(
        await req.api.ssg.build(state.getSSGOptions())
      )
      res.status(200).send(response)
    } catch (e) {
      console.log('Error updating page', e)
      res.status(500).send(e)
    }
  })
