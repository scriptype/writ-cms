const express = require('express')
const multer = require('multer')
const skipWatcher = require('../../middleware/skipWatcher')
const upload = multer()

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
  .post('/', skipWatcher(state), upload.array('attachments'), async (req, res) => {
    try {
      await req.api.homepage.create(
        JSON.parse(req.body.data),
        req.files
      )
      state.setState(
        await req.api.ssg.build(state.getSSGOptions())
      )
      res.sendStatus(200)
    } catch (e) {
      console.log('Error creating homepage', e)
      res.status(500).send(e)
    }
  })
  .put('/', skipWatcher(state), upload.array('attachments'), async (req, res) => {
    try {
      const response = await req.api.homepage.update(
        JSON.parse(req.body.data),
        req.files
      )
      state.setState(
        await req.api.ssg.build(state.getSSGOptions())
      )
      res.status(200).send(response)
    } catch (e) {
      console.log('Error updating homepage', e)
      res.status(500).send(e)
    }
  })
  .delete('/', skipWatcher(state), async (req, res) => {
    try {
      await req.api.homepage.delete()
      state.setState(
        await req.api.ssg.build(state.getSSGOptions())
      )
      res.sendStatus(204)
    } catch (e) {
      if (e.message === 'home not found') {
        return res.status(404).send(e)
      }
      console.log('Error deleting homepage', e)
      res.status(500).send(e)
    }
  })
