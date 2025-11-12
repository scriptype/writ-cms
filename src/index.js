const slug = require('slug')
const { getDefaultSettings } = require('./settings')
const Hooks = require('./hooks')
const { startUp } = require('./routines')

const start = async ({
  rootDirectory,
  debug,
  refreshTheme,
  cli,
  startCMSServer,
  onFinish
}) => {
  return startUp({
    mode: 'start',
    watch: true,
    rootDirectory,
    debug,
    refreshTheme,
    cli,
    startCMSServer,
    onFinish
  })
}

const build = async ({
  rootDirectory,
  debug,
  refreshTheme,
  cli,
  startCMSServer,
  onFinish
}) => {
  return startUp({
    mode: 'build',
    rootDirectory,
    debug,
    refreshTheme,
    cli,
    startCMSServer,
    onFinish
  })
}

module.exports = {
  ...Hooks.api,
  start,
  build,
  getDefaultSettings,
  helpers: {
    slug
  }
}
