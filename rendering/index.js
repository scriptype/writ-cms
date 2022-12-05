const { readdir, writeFile } = require('fs/promises')
const { extname, join, resolve } = require('path')
const Handlebars = require('handlebars')
const { readFileContent } = require('../helpers')
const Views = {
  renderCategoryPages: require('./views/category-page'),
  renderHomepage: require('./views/homepage'),
  copyLocalAssets: require('./views/local-assets'),
  renderPostsJSON: require('./views/posts-json'),
  renderPosts: require('./views/posts'),
  renderSubpages: require('./views/subpages')
}

const PARTIALS_PATH = resolve(join(__dirname, 'partials'))

const helpers = {
  multiLineTextList(list) {
    if (typeof list === 'string') {
      return list
    }
    return list
      .map(s => s.trim()).filter(Boolean)
      .map(s => `<li>${Handlebars.escapeExpression(s)}</li>`)
      .join('\n')
  },

  seeMore() {
    return ''
  },

  isPostType(string, type) {
    return string === type
  }
}

const registerHelpers = () => {
  Object.keys(helpers).forEach((key) => {
    Handlebars.registerHelper(key, helpers[key])
  })
}

const registerPartials = async () => {
  const files = await readdir(PARTIALS_PATH)
  const register = files.map(async (path) => {
    const name = path.replace(extname(path), '')
    const fileContent = await readFileContent(join(PARTIALS_PATH, path))
    Handlebars.registerPartial(name, fileContent)
  })
  return Promise.all(register)
}

const render = ({ path, data, content }) => {
  console.log('rendering:', path)
  const template = Handlebars.compile(content)
  const output = template(data)
  return writeFile(path, output)
}

const init = () => {
  return Promise.all([
    registerHelpers(),
    registerPartials()
  ])
}

module.exports = {
  init,

  async render(contentModel) {
    await init()
    Views.renderHomepage(render, contentModel)
    Views.renderSubpages(render, contentModel)
    Views.renderPostsJSON(contentModel)
    Views.copyLocalAssets(contentModel)
    await Views.renderCategoryPages(render, contentModel)
    return Views.renderPosts(render, contentModel)
  }
}
