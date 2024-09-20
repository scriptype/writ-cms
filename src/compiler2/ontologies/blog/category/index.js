const model = require('./model')
const view = require('./view')

const render = (renderer, blog, contentModel) => {
  console.log('blog render categories', blog.data.categories)
  return Promise.all(
    blog.data.categories.map(category => {
      return view(renderer, category, contentModel)
    })
  )
}

const reduce = (contentModel, entry) => {
  if (!model.match(entry)) {
    return undefined
  }
  return {
    ...contentModel,
    categories: [
      ...(contentModel.categories || []),
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
