const { mkdir } = require('fs/promises')
const { join } = require('path')
const { settings, paths } = require('../settings')
const { renderCategoryIndex } = require('../rendering')

const compileCategoryPages = ({ categories }) => {
  const compilation = categories.map(async category => {
    const dir = join(paths.SITE, category.data.slug)
    await mkdir(dir)
    return renderCategoryIndex({
      path: join(dir, 'index.html'),
      data: {
        site: settings.site,
        category: category.data,
        posts: category.data.posts.map(({ data }) => data)
      }
    })
  })

  return Promise.all(compilation)
}

module.exports = {
  compile: compileCategoryPages
}
