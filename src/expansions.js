const { join } = require('path')
const { debugLog } = require('./debug')
const Settings = require('./settings')

let expansions = []

const init = async () => {
  const settings = Settings.getSettings()
  expansions = [...settings.expansions]

  expansions = expansions
    .map(exp => {
      const pkgPath = join(__dirname, '..', `packages/expansion-${exp}`)
      const pkg = require(pkgPath)
      const mode = settings.mode
      return pkg(settings.mode)
    })

  debugLog('expansions', expansions)
}

const noop =_=>_

const expand =
  (initialValue, fns) =>
    fns.reduce(
      (value, fn = noop) => fn(value),
      initialValue
    )

const expansionHookMap = {
  template: 'useTemplate',
  templatePartials: 'useTemplatePartials',
  templateHelpers: 'useTemplateHelpers',
  content: 'useContent',
  assets: 'useAssets',
  previewApi: 'usePreviewApi',
}

const expandBy =
  (expansionHook) => {
    const hookName = expansionHookMap[expansionHook]
    return (initialValue) => {
      const expandedValue = expand(
        initialValue,
        expansions.map(exp => exp[hookName].bind(exp))
      )
      return expandedValue
    }
      
  }

module.exports = {
  init,
  expandBy,
  expandTemplate: expandBy('useTemplate'),
  expandTemplatePartials: expandBy('useTemplatePartials'),
  expandTemplateHelpers: expandBy('useTemplateHelpers'),
  expandAssets: expandBy('useAssets'),
  expandPreviewApi: expandBy('usePreviewApi'),
  expandContent: expandBy('useContent')
}
