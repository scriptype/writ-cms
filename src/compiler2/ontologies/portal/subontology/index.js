const createModel = require('./model')
const view = require('./view')

module.exports = ({ ontologies }) => {
  const model = createModel({ ontologies })

  const render = (renderer, contentModel) => {
    return view(renderer, contentModel)
  }

  const reduce = (contentModel, entry) => {
    if (!model.match(entry)) {
      return undefined
    }
    return {
      ...contentModel,
      [entry.data.name.data]: model.create(entry).data
    }
  }

  return {
    model,
    view,
    render,
    reduce
  }
}
