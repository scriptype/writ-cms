const { getDefaultSettings } = require('./settings')
const Hooks = require('./hooks')
const { startUp } = require('./routines')

const start = async ({ rootDirectory, watch, debug } = {}) => {
  return startUp({
    mode: 'start',
    rootDirectory,
    watch,
    debug
  })
}

const build = async ({ rootDirectory, debug } = {}) => {
  return startUp({
    mode: 'build',
    rootDirectory,
    debug
  })
}

module.exports = {
  ...Hooks.api,
  start,
  build,
  getDefaultSettings
}
