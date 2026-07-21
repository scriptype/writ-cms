const express = require('express')
const multer = require('multer')
const skipWatcher = require('../../middleware/skipWatcher')
const upload = multer()

module.exports = (state) => express.Router()
  .post('/', skipWatcher(state), upload.array('attachments'), async (req, res) => {
    try {
      const response = await req.api.category.create(
        JSON.parse(req.body.data),
        req.files
      )
      state.setState(
        await req.api.ssg.build(state.getSSGOptions())
      )
      res.status(200).send(response)
    } catch (e) {
      console.log('Error creating new category', e)
      res.status(500).send(e)
    }
  })
  .put('/', skipWatcher(state), upload.array('attachments'), async (req, res) => {
    try {
      const response = await req.api.category.update(
        req.query.path,
        JSON.parse(req.body.data),
        req.files
      )
      state.setState(
        await req.api.ssg.build(state.getSSGOptions())
      )
      res.status(200).send(response)
    } catch (e) {
      console.log('Error updating category', e)
      res.status(500).send(e)
    }
  })
  .delete('/', skipWatcher(state), async (req, res) => {
    try {
      await req.api.category.delete(req.query.path)
      state.setState(
        await req.api.ssg.build(state.getSSGOptions())
      )
      res.sendStatus(204)
    } catch (e) {
      if (e.message === 'category not found') {
        return res.status(404).send(e)
      }
      console.log('Error deleting category', e)
      res.status(500).send(e)
    }
  })
