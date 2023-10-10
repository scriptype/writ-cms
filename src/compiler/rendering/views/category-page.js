const { mkdir } = require('fs/promises')
const { join } = require('path')
const Settings = require('../../../settings')
const Debug = require('../../../debug')
const { finaliseTemplate } = require('../../../routines')

const mkdirCategoryFolder = async (dirName) => {
  try {
    return await mkdir(dirName)
  } catch (EEXIST) {
    return Promise.resolve(true)
  }
}

const renderCategoryPages = (render, { categories }) => {
  const { site, out } = Settings.getSettings()
  const compilation = categories.map(async category => {
    const dir = join(out, category.slug)
    await mkdirCategoryFolder(dir)
    return render({
      path: join(dir, 'index.html'),
      content: await finaliseTemplate('{{>m-doc-greeting}}{{>category}}'),
      data: {
        categories,
        category,
        posts: category.posts,
        site,
        debug: Debug.getDebug()
      }
    })
  })

  return Promise.all(compilation)
}

module.exports = renderCategoryPages
