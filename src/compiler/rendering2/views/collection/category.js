const Settings = require('../../../settings')
const Debug = require('../../../debug')

const renderCategoryPages = (Renderer, contentModel) => {
  const compilation = contentModel.categories.map(category => {
    return Renderer.render({
      templates: [
        `pages/${category.template}`,
        `pages/${category.contentType}`,
        `pages/category`
      ],
      outputPath: category.outputPath,
      content: category.content,
      data: {
        ...contentModel,
        category,
        settings: Settings.getSettings(),
        debug: Debug.getDebug()
      }
    })
  })
  return Promise.all(compilation)
}

module.exports = renderCategoryPages
