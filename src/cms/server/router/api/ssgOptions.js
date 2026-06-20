const express = require('express')

module.exports = (state) => express.Router()
  .get('/', async (req, res) => {
    try {
      res.status(200).json( state.getSSGOptions() )
    } catch (e) {
      console.log('Error getting ssgOptions', e)
      return res.status(500).send(e)
    }
  })
  .put('/', async (req, res) => {
    try {
      state.setState({ ssgOptions: req.body })
      res.status(200).json( state.getSSGOptions() )
    } catch (e) {
      console.log('Error getting ssgOptions', e)
      return res.status(500).send(e)
    }
  })
