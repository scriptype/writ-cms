const { mkdir, readFile } = require('fs/promises')
const { join } = require('path')
const { site, out } = require('../../settings').getSettings()
const { debug } = require('../../debug').getDebug()

const mkdirCategoryFolder = async (dirName) => {
  try {
    return await mkdir(dirName)
  } catch (EEXIST) {
    return Promise.resolve(true)
  }
}

const renderCategoryPages = (render, { categories }, decorateTemplate) => {
  const compilation = categories.map(async category => {
    const dir = join(out, category.slug)
    await mkdirCategoryFolder(dir)
    return render({
      path: join(dir, 'index.html'),
      content: decorateTemplate('{{>category}}'),
      data: {
        category,
        posts: category.posts,
        site: site,
        debug
      }
    })
  })

  return Promise.all(compilation)
}

module.exports = renderCategoryPages
