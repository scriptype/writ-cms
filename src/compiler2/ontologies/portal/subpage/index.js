const model = require('./model')
const view = require('./view')

const render = (renderer, contentModel) => {
  return view(renderer, contentModel)
}

const reduce = (contentModel, entry) => {
  if (!model.match(entry)) {
    return undefined
  }
  return {
    ...contentModel,
    subpages: [
      ...(contentModel.subpages || []),
      model.create(entry).data
    ]
  }
}

module.exports = {
  model,
  view,
  render,
  reduce
}
