const { join } = require('path')
const { mkdir, writeFile } = require('fs/promises')
const { dump } = require('js-yaml')

const createContentTypesModel = ({ getSettings, getContentTypes }) => {
  const createContentType = async ({ name, description = '', attributes, ...config }) => {
    const { rootDirectory } = getSettings()
    const schemaDirectory = join(rootDirectory, 'schema')
    const filePath = join(schemaDirectory, `${name}.md`)
    const frontMatter = dump({
      name,
      attributes,
      ...config
    }, {
      flowLevel: 2
    })
    const fileContent = ['---', frontMatter.replace(/\s+$/, ''), '---', description].join('\n')
    await mkdir(schemaDirectory, { recursive: true })
    await writeFile(filePath, fileContent)
    return { ok: true }
  }

  return {
    get: getContentTypes,
    create: createContentType
  }
}

module.exports = createContentTypesModel
