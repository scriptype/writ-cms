const Handlebars = require('handlebars')
const { readdir, writeFile } = require('fs/promises')
const { extname, join, resolve } = require('path')
const { isDirectory, readFileContent } = require('../../helpers')
const { debugLog } = require('../../debug')
const Settings = require('../../settings')

const commonHelpers = require('../../common/template-helpers')

const commonPartialsPath = resolve(
  join(__dirname, '..', '..', 'common', 'partials')
)

const getThemePartialsPath = () => {
  const { theme } = Settings.getSettings()
  return resolve(
    join(__dirname, '..', '..', '..', 'packages', `theme-${theme}`)
  )
}

const registerHelpers = (helpersDecorator) => {
  const allHelpers = {
    ...commonHelpers,
    ...helpersDecorator(commonHelpers)
  }
  debugLog('registerHelpers', allHelpers)
  Handlebars.registerHelper(allHelpers)
}

const registerPartials = async (partialsPath) => {
  const paths = await Promise.all(
    (await readdir(partialsPath)).map(async path => ({
      path,
      isDirectory: await isDirectory(join(partialsPath, path))
    }))
  )
  const files = paths
    .filter(p => !p.isDirectory && /\.hbs$/i.test(p.path))
    .map(({ path }) => path)
  const register = files.map(async (path) => {
    const name = path.replace(extname(path), '')
    const fileContent = await readFileContent(join(partialsPath, path))
    debugLog('registerPartial', name, join(partialsPath, path))
    Handlebars.registerPartial(name, fileContent)
  })
  return Promise.all(register)
}


module.exports = {
  decorators: {
    helpers: _=>_,
    partials: _=>_,
    template: _=>_
  },

  async init (renderingDecorators) {
    this.decorators = renderingDecorators
    await Promise.all([
      registerHelpers(renderingDecorators.helpers),
      registerPartials(commonPartialsPath)
    ])
    await registerPartials(getThemePartialsPath())
    await Promise.all(
      renderingDecorators.partials([]).map(registerPartials)
    )
  },

  async render({ path, data, content }) {
    debugLog('rendering:', path)
    const decoratedContent = await this.decorators.template(content)
    const template = Handlebars.compile(decoratedContent, {
      noEscape: true,
      preventIndent: true
    })
    const output = template(data)
    return writeFile(path, output)
  }
}
