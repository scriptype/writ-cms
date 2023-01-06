const { mkdir, readFile } = require('fs/promises')
const { join } = require('path')
const { settings, paths } = require('../../settings')

const mkdirCategoryFolder = async (dirName) => {
  try {
    return await mkdir(dirName)
  } catch (EEXIST) {
    return Promise.resolve(true)
  }
}

const renderCategoryPages = (render, { categories }, decorateTemplate) => {
  const compilation = categories.map(async category => {
    const dir = join(paths.out, category.slug)
    await mkdirCategoryFolder(dir)
    return render({
      path: join(dir, 'index.html'),
      content: decorateTemplate('{{>category}}'),
      data: {
        category,
        posts: category.posts,
        site: settings.site
      }
    })
  })

  return Promise.all(compilation)
}

module.exports = renderCategoryPages
