const useContentModel = require('./useContentModel')
const useTemplate = require('./useTemplate')
const useTemplateHelpers = require('./useTemplateHelpers')
const useTemplatePartials = require('./useTemplatePartials')
const useAssets = require('./useAssets')
const usePreviewApi = require('./usePreviewApi')

module.exports = (settings) => {
  return {
    template: useTemplate(settings),
    templateHelpers: useTemplateHelpers(settings),
    templatePartials: useTemplatePartials(settings),
    contentModel: useContentModel(settings),
    assets: useAssets(settings),
    previewApi: usePreviewApi(settings)
  }
}
