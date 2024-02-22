const { mkdir } = require('fs/promises')
const { join } = require('path')
const Settings = require('../../../settings')
const Debug = require('../../../debug')

const mkdirCategoryFolder = async (dirName) => {
  try {
    return await mkdir(dirName)
  } catch (EEXIST) {
    return Promise.resolve(true)
  }
}

const renderCategoryPages = (Renderer, { homepage, categories, posts, subpages }) => {
  const settings = Settings.getSettings()
  const compilation = categories.map(async category => {
    const dir = join(settings.out, category.slug)
    await mkdirCategoryFolder(dir)
    const partial = `pages/homepage/${category.type}`
    return Renderer.render({
      path: join(dir, 'index.html'),
      content: `{{#>${partial}}}${category.content}{{/${partial}}}`,
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
