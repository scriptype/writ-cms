const { mkdirSync } = require('fs')
const { join } = require('path')
const { settings, paths } = require('../settings')
const { render } = require('../rendering')
const { UNCATEGORIZED } = require('../constants')

const compileCategoryPages = (categories) => {
  if (categories.find(c => c.name === UNCATEGORIZED)) {
    mkdirSync(join(paths.SITE, UNCATEGORIZED))
  }
  categories.forEach(category => {
    render({
      content: '{{>category}}',
      path: category.out,
      data: {
        site: settings.site,
        category,
        posts: category.posts
      }
    })
  })
}

module.exports = {
  compile: compileCategoryPages
}
