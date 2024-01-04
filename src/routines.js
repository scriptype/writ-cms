const Debug = require('./debug')
const Settings = require('./settings')
const VersionControl = require('./version-control')
const Theme = require('./theme')
const Hooks = require('./hooks')
const Expansions = require('./expansions')
const SiteDirectory = require('./site-directory')
const CNAME = require('./cname')
const Compiler = require('./compiler')
const Assets = require('./assets')
const Preview = require('./preview')
const Watcher = require('./watcher')

const startUp = async ({ watch, ...rest }) => {
  await run({ ...rest })
  if (watch) {
    startWatcher({ ...rest })
  }
}

const run = async ({ mode, rootDirectory, debug }) => {
  Debug.init(debug)
  Debug.timeStart('> total')
  await Settings.init({
    mode,
    rootDirectory
  })
  await Theme.init()
  await VersionControl.init()
  await Expansions.init()
  await SiteDirectory.create()
  await CNAME.create()
  await Compiler.compile({
    decorators: {
      content: finalise('content'),
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

const startWatcher = (...args) => {
  return Watcher.init({
    decorators: {
      previewApi: finalise('previewApi')
    },
    onChange() {
      return run(...args)
    }
  })
}

const finalise =
  (expansionHook) => {
    return (value) => {
      let result = value
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
