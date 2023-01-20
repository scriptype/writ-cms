const hooks = {
  assets: [],
  content: [],
  previewApi: [],
  templateHelpers: [],
  templatePartials: [],
  template: []
}

const api = {
  use(expansion) {
    console.log('==> hooks.use', expansion)
    Object.keys(expansion).forEach(key => {
      const apiMethod = api[key]
      const fn = expansion[key]
      apiMethod.call(api, fn)
    })
    return this
  },

  useAssets(fn) {
    console.log('=> hooks.useAssets', fn)
    hooks.assets.push(fn)
  },

  useContent(fn) {
    console.log('=> hooks.useContent', fn)
    hooks.content.push(fn)
    return this
  },

  usePreviewApi(fn) {
    console.log('=> hooks.usePreviewApi', fn)
    hooks.previewApi.push(...fn())
    return this
  },

  useTemplate(fn) {
    console.log('=> hooks.useTemplate', fn)
    hooks.template.push(fn)
    return this
  },

  useTemplateHelpers(fn) {
    console.log('=> hooks.useTemplateHelpers', fn)
    hooks.templateHelpers.push(fn)
    return this
  },

  useTemplatePartials(fn) {
    console.log('=> hooks.useTemplatePartials', fn)
    hooks.templatePartials.push(fn)
    return this
  }
}

const expand = (initialValue, fns) => {
  return fns.reduce((value, fn) => fn(value), initialValue)
}

const routines = {
  expandAssets(assets) {
    console.log('=> expandAssets', hooks.assets)
    return [
      ...assets,
      ...hooks.assets.map(_=>_())
    ]
  },

  expandPreviewApi(previewApi) {
    console.log('=> expandPreviewApi', hooks.previewApi)
    return [
      ...previewApi,
      ...hooks.previewApi
    ]
  },

  expandContent(content) {
    console.log('=> expandContent', hooks.content)
    return expand(content, hooks.content)
  },

  expandTemplate(template) {
    return expand(template, hooks.template)
  },

  expandTemplateHelpers(helpers) {
    console.log('=> expandTemplateHelpers', hooks.templateHelpers)
    return expand(helpers, hooks.templateHelpers)
  },

  expandTemplatePartials(partials) {
    console.log('=> expandTemplatePartials', hooks.templatePartials)
    return [
      ...partials,
      ...hooks.templatePartials.map(_=>_())
    ]
  }
}

module.exports = {
  api,
  ...routines
}
