const { getDefaultSettings } = require('./settings')
const Hooks = require('./hooks')
const { startUp } = require('./routines')

const start = async ({ rootDirectory, debug, refreshTheme } = {}) => {
  await startUp({
    mode: 'start',
    watch: true,
    rootDirectory,
    debug,
    refreshTheme
  })
}

const build = async ({ rootDirectory, debug, refreshTheme } = {}) => {
  return startUp({
    mode: 'build',
    rootDirectory,
    debug,
    refreshTheme
  })
}

module.exports = {
  ...Hooks.api,
  start,
  build,
  getDefaultSettings
}
