const { join } = require('path')
const Settings = require('../../../settings')
const Debug = require('../../../debug')

const renderCategoryPages = (Renderer, { homepage, categories, posts, subpages }) => {
  const settings = Settings.getSettings()
  const compilation = categories.map(category => {
    return Renderer.render({
      template: `pages/category/${category.type}`,
      outputPath: join(settings.out, category.slug, 'index.html'),
      content: category.content,
      data: {
        homepage,
        category,
        categories,
        subpages,
        posts,
        categoryPosts: category.posts,
        settings,
        debug: Debug.getDebug()
      }
    })
  })
  return Promise.all(compilation)
}

module.exports = renderCategoryPages
