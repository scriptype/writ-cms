const { join } = require('path')
const { mkdir, writeFile } = require('fs/promises')
const { stringify } = require('yaml')

const createContentTypesModel = ({ getSettings, getContentTypes }) => {
  const createContentType = async ({ name, description = '', attributes, ...config }) => {
    const { rootDirectory } = getSettings()
    const schemaDirectory = join(rootDirectory, 'schema')
    const filePath = join(schemaDirectory, `${name}.md`)
    const frontMatter = stringify({
      name,
      attributes,
      ...config
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
