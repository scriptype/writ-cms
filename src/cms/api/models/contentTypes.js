const matter = require('gray-matter')
const _ = require('lodash')
const { ['default']: filenamify } = require('filenamify')
const { unusedFilename } = require('unused-filename')
const { join, basename } = require('path')
const { writeFile, rm } = require('fs/promises')
const { replaceFilename, validatePath } = require('../helpers')

const findContentType = (contentTypes, path) => {
  return contentTypes.find(ct => ct.path === path)
}

const createContentTypesModel = ({ getSettings, getContentTypes }) => {
  const createContentType = async (data) => {
    const opts = {
      name: data.name || 'Untitled',
      extension: data.extension || '.md',
      metadata: _(data)
        .omit(['name', 'extension', 'description'])
        .pickBy(value => (!!value || value === 0))
        .value()
    }

    const { rootDirectory, contentTypesDirectory } = getSettings()
    const schemaDirectory = join(rootDirectory, contentTypesDirectory)

    const sanitizedName = filenamify(opts.name)
    const path = join(schemaDirectory, `${sanitizedName}${opts.extension}`)
    const unusedPath = await unusedFilename(path)

    const shouldOverrideName = (sanitizedName !== opts.name) || (unusedPath !== path)
    const metadataWithName = shouldOverrideName ?
      {
        ...opts.metadata,
        name: `${opts.name}`
      } : opts.metadata

    const metadataWithDescription = data.description.includes('\n') ?
      metadataWithName :
      {
        ...metadataWithName,
        description: data.description
      }

    const dump = {
      data: metadataWithDescription,
      content: ''
    }

    if (!metadataWithDescription.description) {
      dump.content = data.description
    }

    const fileContent = matter.stringify(dump)
    await writeFile(unusedPath, fileContent)

    return {
      path: basename(unusedPath)
    }
  }

  const updateContentType = async (path, data) => {
    if (!path) {
      throw new Error('path is required')
    }

    if (!data.model) {
      throw new Error('data.model is required')
    }

    const opts = {
      title: data.name || 'Untitled',
      extension: data.extension || '.md',
      metadata: _(data)
        .omit(['name', 'extension', 'description'])
        .pickBy(value => (!!value || value === 0))
        .value()
    }

    const contentType = findContentType(getContentTypes(), path)

    const isTitleDifferent = opts.title !== contentType.pathName
    let absolutePath = contentType.absolutePath
    let isPathDifferentThanTitle

    if (isTitleDifferent) {
      const sanitizedTitle = filenamify(opts.title)
      const sanitizedPath = replaceFilename(contentType.absolutePath, sanitizedTitle)
      const unusedPath = await unusedFilename(sanitizedPath)

      await rm(contentType.absolutePath)

      isPathDifferentThanTitle = (sanitizedTitle !== opts.title) || (unusedPath !== sanitizedPath)
      absolutePath = `${unusedPath}${opts.extension || contentType.extension}`
    }

    const metadataWithName = isPathDifferentThanTitle ? {
      ...opts.metadata,
      name: `${opts.title}`
    } : opts.metadata

    const metadataWithDescription = data.description.includes('\n') ?
      metadataWithName :
      {
        ...metadataWithName,
        description: data.description
      }

    const dump = {
      data: metadataWithDescription,
      content: ''
    }

    if (!metadataWithDescription.description) {
      dump.content = data.description
    }

    const fileContent = matter.stringify(dump)
    await writeFile(absolutePath, fileContent)

    return {
      path: basename(absolutePath)
    }
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
    update: updateContentType,
    delete: deleteContentType
  }
}

module.exports = createContentTypesModel
