const Debug = require('./debug')
const Settings = require('./settings')
const Hooks = require('./hooks')
const Expansions = require('./expansions')

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
  await require('./compiler').compile()
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
      result = require('./custom-theme').use(expansionHook, result)
      return result
    }
  }

const Routines = {
  startUp,
  finaliseTemplate: finalise('template'),
  finaliseTemplatePartials: finalise('templatePartials'),
  finaliseTemplateHelpers: finalise('templateHelpers'),
  finaliseAssets: finalise('assets'),
  finalisePreviewApi: finalise('previewApi'),
  finaliseContent: finalise('content')
}

module.exports = Routines
