const Debug = require('./debug')
const Settings = require('./settings')
const Decorations = require('./decorations')
const VersionControl = require('./version-control')
const Theme = require('./theme')
const Hooks = require('./hooks')
const Expansions = require('./expansions')
const SiteDirectory = require('./site-directory')
const CNAME = require('./cname')
const Dictionary = require('./dictionary')
const Compiler = require('./compiler')
const Assets = require('./assets')
const Preview = require('./preview')
const Watcher = require('./watcher')
const createCMS = require('./cms')

const startUp = async ({ mode, rootDirectory, debug, watch, refreshTheme, startCMSServer, ...rest }) => {
  Debug.init(debug)
  Debug.timeStart('> total')
  const cms = createCMS()
  await run({
    mode,
    rootDirectory,
    refreshTheme,
    finishCallback: cms.setState,
    ...rest
  })
  if (watch) {
    if (startCMSServer !== false) {
      cms.server.start({
        silent: !rest.cli
      })
    }
    return startWatcher({
      mode,
      rootDirectory,
      finishCallback: cms.setState,
      ...rest
    })
  }
}

const run = async ({ mode, rootDirectory, refreshTheme, finishCallback }) => {
  await Settings.init({
    mode,
    rootDirectory
  })
  await Expansions.init()
  Decorations.register(
    Dictionary.decorator(),
    VersionControl.decorator(),
    Theme.decorator(),
    Preview.decorator(),
    Expansions.decorator(),
    Hooks.decorator()
  )
  await Theme.init({
    refresh: refreshTheme
  })
  await VersionControl.init()
  await Dictionary.init()
  await SiteDirectory.create()
  await CNAME.create()
  const { fileSystemTree, contentModel } = await Compiler.compile()
  await Assets.copyAssets()
  finishCallback({
    settings: Settings.getSettings(),
    fileSystemTree,
    contentModel
  })
  Debug.timeEnd('> total')
  Debug.logTimes()
}

const startWatcher = (options) => {
  return Watcher.init({
    onChange() {
      return run(options)
    },
    silent: !options.cli
  })
}

const Routines = {
  startUp,
  run,
  startWatcher
}

module.exports = Routines
