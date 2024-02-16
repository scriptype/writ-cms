const { getDefaultSettings } = require('./settings')
const Hooks = require('./hooks')
const { startUp } = require('./routines')
const helpers = require('./helpers')

const start = async ({ rootDirectory, debug, refreshTheme, cli, startCMSServer }) => {
  return startUp({
    mode: 'start',
    watch: true,
    rootDirectory,
    debug,
    refreshTheme,
    cli,
    startCMSServer
  })
}

const build = async ({ rootDirectory, debug, refreshTheme, cli, startCMSServer }) => {
  return startUp({
    mode: 'build',
    rootDirectory,
    debug,
    refreshTheme,
    cli,
    startCMSServer
  })
}

module.exports = {
  ...Hooks.api,
  start,
  build,
  getDefaultSettings,
  helpers
}
