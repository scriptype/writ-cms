const matter = require('gray-matter')
const _ = require('lodash')
const { ['default']: filenamify } = require('filenamify')
const { unusedFilename } = require('unused-filename')
const { writeFile, mkdir, rename, rm } = require('fs/promises')
const { join, dirname, basename, relative } = require('path')
const { contentRootPath, omitResolvedLinks } = require('../helpers')

const replaceFilename = (oldAbsolutePath, newAbsolutePath) => {
  return join(
    dirname(oldAbsolutePath),
    basename(newAbsolutePath)
  )
}

const deleteAttachments = (attachments, parentAbsolutePath) => {
  return attachments.map(fileName => {
    const filePath = join(parentAbsolutePath, fileName)
    return rm(filePath)
  })
}

const uploadAttachments = (attachments, parentAbsolutePath) => {
  return attachments.map(file => {
    const dest = join(parentAbsolutePath, file.originalname)
    return writeFile(dest, file.buffer)
  })
}

const createCollectionsModel = ({ getSettings, getContentModel }) => {
  const getCollections = () => {
    return omitResolvedLinks(getContentModel().subtree.collections)
  }

  const createCollection = async (data, attachments) => {
    const opts = {
      title: data.title || 'Untitled',
      content: data.content || '',
      excerpt: data.excerpt || '',
      extension: data.extension || 'md',
      deletedAttachments: data.deletedAttachments || [],
      metadata: _(data)
        .omit(['title', 'content', 'excerpt', 'extension', 'deletedAttachments'])
        .pickBy(value => (!!value || value === 0))
        .value()
    }

    const { rootDirectory, contentDirectory } = getSettings()
    const root = await contentRootPath(rootDirectory, contentDirectory)

    const sanitizedTitle = filenamify(opts.title)

    const path = join(root, sanitizedTitle)
    const unusedPath = await unusedFilename(path)

    const shouldOverrideTitle = (sanitizedTitle !== opts.title) || (unusedPath !== path)
    const metadataWithTitle = shouldOverrideTitle ?
      {
        ...opts.metadata,
        title: `${opts.title}`
      } : opts.metadata

    const fileContent = matter.stringify({
      data: metadataWithTitle,
      content: opts.content,
      excerpt: opts.excerpt
    })
    try {
      await mkdir(unusedPath, { recursive: true })
    } catch {}
    return Promise.all([
      writeFile(`${join(unusedPath, 'collection')}.${opts.extension}`, fileContent),
      ...uploadAttachments(attachments, unusedPath)
    ])
  }

  const updateCollection = async (path, data, attachments) => {
    if (!path) {
      throw new Error('path is required')
    }

    const opts = {
      title: data.title || 'Untitled',
      content: data.content || '',
      excerpt: data.excerpt || '',
      extension: data.extension || '',
      deletedAttachments: data.deletedAttachments || [],
      metadata: _(data)
        .omit(['title', 'content', 'excerpt', 'extension', 'deletedAttachments'])
        .pickBy(value => (!!value || value === 0))
        .value()
    }

    const collection = getContentModel().subtree.collections.find(c => c.name === path)

    const isTitleDifferent = opts.title !== collection.title
    let absolutePath = collection.absolutePath
    let isPathDifferentThanTitle

    if (isTitleDifferent) {
      const sanitizedTitle = filenamify(opts.title)
      const sanitizedPath = replaceFilename(collection.absolutePath, sanitizedTitle)
      const unusedPath = await unusedFilename(sanitizedPath)

      await rename(collection.absolutePath, unusedPath)

      isPathDifferentThanTitle = (sanitizedTitle !== opts.title) || (unusedPath !== sanitizedPath)
      absolutePath = unusedPath
    }

    const metadataWithTitle = isPathDifferentThanTitle ? {
      ...opts.metadata,
      title: `${opts.title}`
    } : opts.metadata

    const fileContent = matter.stringify({
      data: metadataWithTitle,
      content: opts.content,
      excerpt: opts.excerpt
    })

    const targetPath = join(absolutePath, collection.indexFile.name)

    await Promise.all([
      writeFile(targetPath, fileContent),
      (async () => {
        await Promise.all(deleteAttachments(opts.deletedAttachments, absolutePath))
        await Promise.all(uploadAttachments(attachments, absolutePath))
      })()
    ])

    const { rootDirectory, contentDirectory } = getSettings()
    const root = await contentRootPath(rootDirectory, contentDirectory)

    return {
      path: relative(root, absolutePath)
    }
  }

  return {
    get: getCollections,
    create: createCollection,
    update: updateCollection
  }
}

module.exports = createCollectionsModel
