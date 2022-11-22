const { mkdirSync } = require('fs')
const { join } = require('path')
const { settings, paths } = require('../settings')
const { render } = require('../rendering')
const { UNCATEGORIZED } = require('../constants')

const compileCategoryPages = (categories) => {
  categories.forEach(category => {
    const dir = join(paths.SITE, category.data.slug)
    mkdirSync(dir)
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
