const { getDefaultSettings } = require('./settings')
const Hooks = require('./hooks')
const { startUp } = require('./routines')
const helpers = require('./helpers')

const start = async ({ rootDirectory, debug, refreshTheme, cli, startCMS }) => {
  return startUp({
    mode: 'start',
    watch: true,
    rootDirectory,
    debug,
    refreshTheme,
    cli,
    startCMS
  })
}

const build = async ({ rootDirectory, debug, refreshTheme, cli, startCMS }) => {
  return startUp({
    mode: 'build',
    rootDirectory,
    debug,
    refreshTheme,
    cli,
    startCMS
  })
}

module.exports = {
  ...Hooks.api,
  start,
  build,
  getDefaultSettings,
  helpers
}
