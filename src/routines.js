const Debug = require('./debug')
const Settings = require('./settings')
const Hooks = require('./hooks')
const Expansions = require('./expansions')
const CustomTheme = require('./custom-theme')
const SiteDirectory = require('./site-directory')
const Compiler = require('./compiler')
const Assets = require('./assets')

const startUp = async ({ mode, rootDirectory, watch, debug }) => {
  if (mode === 'start') {
    console.log('⚠️  Watch out for frustration.')
  }
  Debug.init(debug)
  Debug.debugLog('startUp', { mode, rootDirectory, watch, debug })
  await Settings.init({
    mode,
    rootDirectory
  })
  await Expansions.init()
  await CustomTheme.init()
  await SiteDirectory.create()
  await Compiler.compile({
    decorators: {
      content: finalise('content'),
      rendering: {
        helpers: finalise('templateHelpers'),
        partials: finalise('templatePartials'),
        template: finalise('template')
      }
    }
  })
  await Assets.copyAssets({
    decorators: {
      assets: finalise('assets')
    }
  })
  if (mode === 'start' && watch !== false) {
    return require('./preview').init()
  }
  return Promise.resolve()
}

const finalise =
  (expansionHook) => {
    return (value) => {
      let result
      result = Expansions.expandBy(expansionHook)(value)
      result = Hooks.expand(expansionHook, result)
      result = require('./preview').use(expansionHook, result)
      result = CustomTheme.use(expansionHook, result)
      return result
    }
  }

const Routines = {
  startUp,
  finalisePreviewApi: finalise('previewApi'),
}

module.exports = Routines
