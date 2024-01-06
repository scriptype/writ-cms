const hooks = {
  assets: [],
  contentModel: [],
  previewApi: [],
  templateHelpers: [],
  templatePartials: [],
  template: []
}

const api = {
  use(expansion) {
    Object.keys(expansion).forEach(key => {
      const apiMethod = api[key]
      const fn = expansion[key]
      apiMethod.call(api, fn)
    })
    return this
  },

  useAssets(fn) {
    hooks.assets.push(...fn())
    return this
  },

  useContentModel(fn) {
    hooks.contentModel.push(fn)
    return this
  },

  usePreviewApi(fn) {
    hooks.previewApi.push(...fn())
    return this
  },

  useTemplate(fn) {
    hooks.template.push(fn)
    return this
  },

  useTemplateHelpers(fn) {
    hooks.templateHelpers.push(fn)
    return this
  },

  useTemplatePartials(fn) {
    hooks.templatePartials.push(fn)
    return this
  }
}

const expand = (initialValue, fns) => {
  return fns.reduce((value, fn) => fn(value), initialValue)
}

const expandTemplate = (template) => {
  return expand(template, hooks.template)
}

const expandTemplateHelpers = (helpers) => {
  return expand(helpers, hooks.templateHelpers)
}

const expandTemplatePartials = (partials) => {
  return [
    ...partials,
    ...hooks.templatePartials.map(_=>_())
  ]
}

const expandContentModel = (contentModel) => {
  return expand(contentModel, hooks.contentModel)
}

const expandAssets = (assets) => {
  return [
    ...assets,
    ...hooks.assets
  ]
}

const expandPreviewApi = (previewApi) => {
  return [
    ...previewApi,
    ...hooks.previewApi
  ]
}

module.exports = {
  api,

  expand(expansionHook, value) {
    return {
      template: expandTemplate,
      templatePartials: expandTemplatePartials,
      templateHelpers: expandTemplateHelpers,
      contentModel: expandContentModel,
      assets: expandAssets,
      previewApi: expandPreviewApi,
    }[expansionHook](value)
  },

  expandTemplate,
  expandTemplatePartials,
  expandTemplateHelpers,
  expandContentModel,
  expandAssets,
  expandPreviewApi,
}
