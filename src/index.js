const { getDefaultSettings } = require('./settings')
const Hooks = require('./hooks')
const { startUp } = require('./routines')
const helpers = require('./helpers')

const start = async ({ rootDirectory, debug, refreshTheme, cli } = {}) => {
  return startUp({
    mode: 'start',
    watch: true,
    rootDirectory,
    debug,
    refreshTheme,
    cli
  })
}

const build = async ({ rootDirectory, debug, refreshTheme, cli } = {}) => {
  return startUp({
    mode: 'build',
    rootDirectory,
    debug,
    refreshTheme,
    cli
  })
}

module.exports = {
  ...Hooks.api,
  start,
  build,
  getDefaultSettings,
  helpers
}
