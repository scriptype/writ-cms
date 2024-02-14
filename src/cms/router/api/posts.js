const express = require('express')
const { posts } = require('../../api')

module.exports = express.Router()
  .get('/', async (req, res, next) => {
    try {
      res.status(200).json(
        await posts.getAll(req.body)
      )
    } catch (e) {
      console.log('Error getting posts', e)
      return res.status(500).send(e)
    }
  })
  .get('/*', async (req, res, next) => {
    const postPath = decodeURI(req.path.replace(/\/posts\//, ''))
    try {
      res.status(200).json(
        await posts.get(postPath, req.body)
      )
    } catch (e) {
      console.log('Error getting post', e)
      return res.status(500).send(e)
    }
  })
  .put('/', async (req, res, next) => {
    try {
      await posts.create(req.body)
      res.sendStatus(200)
    } catch (e) {
      console.log('Error creating new post', e)
      res.status(500).send(e)
    }
  })
