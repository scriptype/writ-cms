const express = require('express')
const multer = require('multer')
const skipWatcher = require('../../middleware/skipWatcher')
const upload = multer()

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
  .post('/', skipWatcher(state), upload.array('attachments'), async (req, res) => {
    try {
      await req.api.subpage.create(
        JSON.parse(req.body.data),
        req.files
      )
      state.setState(
        await req.api.ssg.build(state.getSSGOptions())
      )
      res.sendStatus(200)
    } catch (e) {
      console.log('Error creating new subpage', e)
      res.status(500).send(e)
    }
  })
  .put('/', skipWatcher(state), upload.array('attachments'), async (req, res) => {
    try {
      const response = await req.api.subpage.update(
        req.query.path,
        JSON.parse(req.body.data),
        req.files
      )
      state.setState(
        await req.api.ssg.build(state.getSSGOptions())
      )
      res.status(200).send(response)
    } catch (e) {
      console.log('Error updating page', e)
      res.status(500).send(e)
    }
  })
