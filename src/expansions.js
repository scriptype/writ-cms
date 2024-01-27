const { join } = require('path')
const Debug = require('./debug')
const Settings = require('./settings')

let expansions = []

const init = async () => {
  Debug.timeStart('expansions')
  const settings = Settings.getSettings()
  expansions = [...settings.expansions]

  expansions = expansions
    .map(exp => {
      const pkgPath = join(__dirname, '..', `packages/expansion-${exp}`)
      const pkg = require(pkgPath)
      return pkg(settings.mode)
    })

  Debug.debugLog('expansions', expansions)
  Debug.timeEnd('expansions')
}

const noop =_=>_

const expand =
  (initialValue, fns) =>
    fns.reduce(
      (value, fn) => fn(value),
      initialValue
    )

const expansionHookMap = {
  dictionary: 'useDictionary',
  template: 'useTemplate',
  templatePartials: 'useTemplatePartials',
  templateHelpers: 'useTemplateHelpers',
  contentModel: 'useContentModel',
  assets: 'useAssets',
  previewApi: 'usePreviewApi',
}

const expandBy =
  (expansionHook) => {
    const hookName = expansionHookMap[expansionHook]
    return (initialValue) => {
      const expandedValue = expand(
        initialValue,
        expansions.map(exp => (exp[hookName] || noop).bind(exp))
      )
      return expandedValue
    }
  }

module.exports = {
  init,
  expandBy,
  expandDictionary: expandBy('useDictionary'),
  expandTemplate: expandBy('useTemplate'),
  expandTemplatePartials: expandBy('useTemplatePartials'),
  expandTemplateHelpers: expandBy('useTemplateHelpers'),
  expandAssets: expandBy('useAssets'),
  expandPreviewApi: expandBy('usePreviewApi'),
  expandContentModel: expandBy('useContentModel')
}
