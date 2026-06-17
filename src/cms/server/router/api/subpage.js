const express = require('express')

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
  .post('/', async (req, res) => {
    try {
      await req.api.subpage.create(req.body)
      res.sendStatus(200)
    } catch (e) {
      console.log('Error creating new subpage', e)
      res.status(500).send(e)
    }
  })
  .put('/', async (req, res) => {
    try {
      state.skipWatcherBuild()
      const response = await req.api.subpage.update(req.body)
      const ssgOptions = await state.getSSGOptions()
      state.setState(await req.api.ssg.build(ssgOptions))
      res.status(200).send(response)
    } catch (e) {
      console.log('Error updating page', e)
      res.status(500).send(e)
    } finally {
      setTimeout(() => {
        state.unskipWatcherBuild()
      }, 500)
    }
  })
