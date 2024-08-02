const { join } = require('path')
const Settings = require('../../../../settings')
const Debug = require('../../../../debug')

const renderCategoryPages = (Renderer, contentModel) => {
  if (!contentModel.categories || !contentModel.categories.length) {
    return Promise.resolve()
  }
  const settings = Settings.getSettings()
  const { out } = settings
  const compilation = contentModel.categories.map(category => {
    return Renderer.render({
      template: `blog/pages/category/${category.type}`,
      outputPath: join(out, contentModel.outputPrefix, category.slug, 'index.html'),
      content: category.content,
      data: {
        ...contentModel,
        category,
        settings,
        debug: Debug.getDebug()
      }
    })
  })
  return Promise.all(compilation)
}

module.exports = renderCategoryPages
