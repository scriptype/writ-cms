const { getDefaultSettings } = require('./settings')
const Hooks = require('./hooks')
const { startUp } = require('./routines')

const start = async ({ rootDirectory, debug } = {}) => {
  await startUp({
    mode: 'start',
    rootDirectory,
    watch: true,
    debug,
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
