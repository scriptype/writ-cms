const { getDefaultSettings } = require('./settings')
const Hooks = require('./hooks')
const { startUp } = require('./routines')
const helpers = require('./helpers')

const start = async ({
  rootDirectory,
  rootContentModel,
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
    rootContentModel,
    debug,
    refreshTheme,
    cli,
    startCMSServer,
    onFinish
  })
}

const build = async ({
  rootDirectory,
  rootContentModel,
  debug,
  refreshTheme,
  cli,
  startCMSServer,
  onFinish
}) => {
  return startUp({
    mode: 'build',
    rootDirectory,
    rootContentModel,
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
  helpers
}
