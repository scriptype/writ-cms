const { join } = require('path')
const Settings = require('../../../settings')
const Debug = require('../../../debug')

const renderCategoryPages = (Renderer, contentModel) => {
  const settings = Settings.getSettings()
  const compilation = contentModel.categories.map(category => {
    return Renderer.render({
      template: `pages/category/${category.type}`,
      outputPath: join(settings.out, category.slug, 'index.html'),
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
