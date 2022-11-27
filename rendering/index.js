const handlebars = require('./handlebars')

const renderers = [handlebars]

const getRenderer = (extension) => {
  const renderer = renderers.find(
    ({ EXTENSION_PATTERN }) => EXTENSION_PATTERN.test(extension)
  )
  return renderer
}

const render = ({ extension, content, path, data }) => {
  const renderer = getRenderer(extension)
  if (renderer) {
    console.log('rendering:', path)
    return renderer.render({
      content,
      path,
      data
    })
  }
}

const renderCategoryIndex = (params) => {
  return render({
    ...params,
    extension: '.hbs',
    content: '{{>category}}'
  })
}

const renderHomePage = (params) => {
  return render({
    ...params,
    extension: '.hbs',
    content: '{{>index}}',
  })
}

const templateParser = {
  isTemplate({ extension, name }) {
    if (!extension) {
      return false
    }
    const renderer = getRenderer(extension)
    return !!renderer
  },

  parseTemplate({ extension, content }) {
    const renderer = getRenderer(extension)
    if (renderer) {
      return renderer.templateParser.parseTemplate(content)
    }
    return {
      unparsed: true
    }
  }
}

module.exports = {
  render,
  renderCategoryIndex,
  renderHomePage,
  templateParser
}
