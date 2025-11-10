const createDecorator = require('./decorator')

const decorationKeyToMethod = {
  template: 'useTemplate',
  templatePartials: 'useTemplatePartials',
  templateHelpers: 'useTemplateHelpers',
  contentModel: 'useContentModel',
  assets: 'useAssets',
  previewApi: 'usePreviewApi',
}

const State = {
  hooks: {
    assets: [],
    contentModel: [],
    previewApi: [],
    templateHelpers: [],
    templatePartials: [],
    template: []
  }
}

const Methods = {
  use(decorator) {
    Object.keys(decorator).forEach(decorationKey => {
      const method = decorationKeyToMethod[decorationKey]
      Methods[method].call(Methods, decorator[decorationKey])
    })
    return this
  },

  useAssets(fn) {
    State.hooks.assets.push(fn)
    return this
  },

  useContentModel(fn) {
    State.hooks.contentModel.push(fn)
    return this
  },

  usePreviewApi(fn) {
    State.hooks.previewApi.push(fn)
    return this
  },

  useTemplate(fn) {
    State.hooks.template.push(fn)
    return this
  },

  useTemplateHelpers(fn) {
    State.hooks.templateHelpers.push(fn)
    return this
  },

  useTemplatePartials(fn) {
    State.hooks.templatePartials.push(fn)
    return this
  }
}

module.exports = {
  api: Methods,
  decorator: createDecorator(State)
}
