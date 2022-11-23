const { mkdir } = require('fs/promises')
const { join } = require('path')
const { settings, paths } = require('../settings')
const { render } = require('../rendering')

const compileCategoryPages = ({ categories }) => {
  categories.forEach(async category => {
    const dir = join(paths.SITE, category.data.slug)
    await mkdir(dir)
    render({
      content: '{{>category}}',
      path: join(dir, 'index.html'),
      data: {
        site: settings.site,
        category: category.data,
        posts: category.data.posts.map(({ data }) => data)
      }
    })
  })
}

module.exports = {
  compile: compileCategoryPages
}
