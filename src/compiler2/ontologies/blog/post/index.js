const model = require('./model')
const view = require('./view')

const render = (renderer, blog, contentModel) => {
  return Promise.all(
    blog.data.posts.map(post => {
      return view(renderer, post, contentModel)
    })
  )
}

const reduce = (contentModel, entry) => {
  if (!model.match(entry)) {
    return undefined
  }
  return [
    ...contentModel,
    model.create(entry).data
  ]
}

module.exports = {
  model,
  view,
  render,
  reduce
}
