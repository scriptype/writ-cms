const Debug = require('./debug')
const Settings = require('./settings')
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

const startUp = async ({ watch, refreshTheme, ...rest }) => {
  await run({ refreshTheme, ...rest })
  if (watch) {
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
  await Theme.init({
    refresh: refreshTheme
  })
  await VersionControl.init()
  await Expansions.init()
  await Dictionary.init({
    decorators: {
      dictionary: finalise('dictionary')
    }
  })
  await SiteDirectory.create()
  await CNAME.create()
  await Compiler.compile({
    decorators: {
      contentModel: finalise('contentModel'),
      rendering: {
        helpers: finalise('templateHelpers'),
        partials: finalise('templatePartials'),
        template: finalise('template')
      }
    },
    cache: VersionControl.createCache()
  })
  await Assets.copyAssets({
    decorators: {
      assets: finalise('assets')
    }
  })
  Debug.timeEnd('> total')
  Debug.logTimes()
}

const startWatcher = (options) => {
  return Watcher.init({
    decorators: {
      previewApi: finalise('previewApi')
    },
    onChange() {
      return run(options)
    },
    silent: !options.cli
  })
}

const finalise =
  (expansionHook) => {
    return (value) => {
      let result = value
      result = Dictionary.use(expansionHook, result)
      result = Theme.use(expansionHook, result)
      result = Preview.use(expansionHook, result)
      result = Expansions.expandBy(expansionHook)(result)
      result = Hooks.expand(expansionHook, result)
      return result
    }
  }

const Routines = {
  startUp,
  run,
  startWatcher
}

module.exports = Routines
