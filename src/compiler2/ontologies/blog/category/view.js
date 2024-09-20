const { join } = require('path')
const Settings = require('../../../../settings')
const Debug = require('../../../../debug')

const renderCategoryPage = (Renderer, category, contentModel) => {
  console.log('(not) render category page', category, contentModel.outputPrefix)
  return
  const settings = Settings.getSettings()
  const { out } = settings
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
}

module.exports = renderCategoryPage
