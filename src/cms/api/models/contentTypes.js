const { join } = require('path')
const { mkdir, writeFile, rm } = require('fs/promises')
const { dump } = require('js-yaml')
const { validatePath } = require('../helpers')

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

  const deleteContentType = async (path) => {
    if (!path) {
      throw new Error('path is required')
    }

    const contentType = getContentTypes().find(p => p.path === path)

    if (!contentType) {
      throw new Error('content type not found')
    }

    const isPathValid = await validatePath(
      getSettings(),
      contentType.absolutePath,
      { rootChild: true }
    )
    if (!isPathValid) {
      throw new Error('invalid page path')
    }

    await rm(contentType.absolutePath, { recursive: true, force: true })
  }

  return {
    get: getContentTypes,
    create: createContentType,
    delete: deleteContentType
  }
}

module.exports = createContentTypesModel
