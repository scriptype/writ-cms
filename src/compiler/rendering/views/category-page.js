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

const renderCategoryPages = (Renderer, { categories }) => {
  const settings = Settings.getSettings()
  const compilation = categories.map(async category => {
    const dir = join(settings.out, category.slug)
    await mkdirCategoryFolder(dir)
    return Renderer.render({
      path: join(dir, 'index.html'),
      content: '{{>pages/category}}',
      data: {
        categories,
        category,
        posts: category.posts,
        settings,
        debug: Debug.getDebug()
      }
    })
  })

  return Promise.all(compilation)
}

module.exports = renderCategoryPages
