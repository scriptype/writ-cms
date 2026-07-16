const express = require('express')
const skipWatcher = require('../../middleware/skipWatcher')

module.exports = (state) => express.Router()
  .get('/', async (req, res) => {
    try {
      res.status(200).json(
        await req.api.contentTypes.get()
      )
    } catch (e) {
      console.log('Error getting contentTypes', e)
      return res.status(500).send(e)
    }
  })
  .post('/', async (req, res) => {
    try {
      res.status(200).json(
        await req.api.contentTypes.create(req.body)
      )
    } catch (e) {
      console.log('Error creating contentType', e)
      return res.status(500).send(e)
    }
  })
  .put('/', skipWatcher(state), async (req, res) => {
    try {
      const response = await req.api.contentTypes.update(
        req.query.path,
        JSON.parse(req.body.data)
      )
      state.setState(
        await req.api.ssg.build(state.getSSGOptions())
      )
      res.status(200).send(response)
    } catch (e) {
      console.log('Error updating content-type', e)
      res.status(500).send(e)
    }
  })
  .delete('/', skipWatcher(state), async (req, res) => {
    try {
      await req.api.contentTypes.delete(req.query.path)
      state.setState(
        await req.api.ssg.build(state.getSSGOptions())
      )
      res.sendStatus(204)
    } catch (e) {
      if (e.message === 'content type not found') {
        return res.status(404).send(e)
      }
      console.log('Error deleting content type', e)
      res.status(500).send(e)
    }
  })
