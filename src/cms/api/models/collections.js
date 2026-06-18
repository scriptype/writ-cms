const matter = require('gray-matter')
const { ['default']: filenamify } = require('filenamify')
const { unusedFilename } = require('unused-filename')
const { writeFile, mkdir, rename } = require('fs/promises')
const { join, dirname, basename, relative } = require('path')
const { contentRootPath, omitResolvedLinks } = require('../helpers')

const replaceFilename = (oldAbsolutePath, newAbsolutePath) => {
  return join(
    dirname(oldAbsolutePath),
    basename(newAbsolutePath)
  )
}

const createCollectionsModel = ({ getSettings, getContentModel }) => {
  const getCollections = () => {
    return omitResolvedLinks(getContentModel().subtree.collections)
  }

  const createCollection = async ({
    title,
    content,
    excerpt,
    extension,
    metadata
  }) => {
    const opts = {
      title: title || 'Untitled',
      content: content || '',
      excerpt: excerpt || '',
      extension: extension || 'md',
      metadata: metadata || {}
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
    return writeFile(`${join(unusedPath, 'collection')}.${opts.extension}`, fileContent)
  }

  const updateCollection = async ({
    path,
    title,
    content,
    excerpt,
    extension,
    metadata
  }) => {
    if (!path) {
      throw new Error('path is required')
    }

    const opts = {
      title: title || 'Untitled',
      content: content || '',
      excerpt: excerpt || '',
      extension: extension || '',
      metadata: metadata || {}
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
    } : metadata

    const fileContent = matter.stringify({
      data: metadataWithTitle,
      content: opts.content,
      excerpt: opts.excerpt
    })

    const targetPath = join(absolutePath, collection.indexFile.name)

    await writeFile(targetPath, fileContent)

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
