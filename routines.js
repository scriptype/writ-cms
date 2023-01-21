const Debug = require('./debug')
const Settings = require('./settings')
const Hooks = require('./hooks')
const Expansions = require('./expansions')

const startUp = async ({ mode, rootDirectory, watch, debug }) => {
  Debug.init(debug)
  Debug.debugLog('startUp', { mode, rootDirectory, watch, debug })
  await Settings.init({
    mode,
    rootDirectory
  })
  await Expansions.init()
  if (mode === 'start' && watch !== false) {
    const Preview = require('./preview')
    return Preview.init()
  }
  return require('./compiler').compile()
}

const finalise =
  (expansionHook) => {
    return (value) => {
      const expandedValue = Expansions.expandBy(expansionHook)(value)
      const hookedValue = Hooks.expand(expansionHook, expandedValue)
      const previewUsedValue = require('./preview').use(expansionHook, hookedValue)
      return previewUsedValue
    }
  }

const Routines = {
  startUp,
  finalise,
  finaliseTemplate: finalise('template'),
  finaliseTemplatePartials: finalise('templatePartials'),
  finaliseTemplateHelpers: finalise('templateHelpers'),
  finaliseAssets: finalise('assets'),
  finalisePreviewApi: finalise('previewApi'),
  finaliseContent: finalise('content')
}

module.exports = Routines
