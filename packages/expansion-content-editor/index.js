const useContentModel = require('./useContentModel')
const useTemplate = require('./useTemplate')
const useTemplateHelpers = require('./useTemplateHelpers')
const useTemplatePartials = require('./useTemplatePartials')
const useAssets = require('./useAssets')
const usePreviewApi = require('./usePreviewApi')

module.exports = (mode) => {
  return {
    useTemplate: useTemplate(mode),
    useTemplateHelpers: useTemplateHelpers(mode),
    useTemplatePartials: useTemplatePartials(mode),
    useContentModel: useContentModel(mode),
    useAssets: useAssets(mode),
    usePreviewApi: usePreviewApi(mode)
  }
}
