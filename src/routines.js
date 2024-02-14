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
const CMS = require('./cms/server')

const startUp = async ({ watch, refreshTheme, ...rest }) => {
  await run({ refreshTheme, ...rest })
  if (watch) {
    CMS.init()
    return startWatcher({ ...rest })
  }
}

const run = async ({ mode, rootDirectory, debug, refreshTheme }) => {
  Debug.init(debug)
  Debug.timeStart('> total')
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
  await Compiler.compile()
  await Assets.copyAssets()
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
