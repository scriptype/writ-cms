const matter = require('gray-matter')
const { ['default']: filenamify } = require('filenamify')
const { unusedFilename } = require('unused-filename')
const { writeFile, mkdir } = require('fs/promises')
const { join } = require('path')
const { contentRootPath, omitResolvedLinks } = require('../helpers')

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

  return {
    get: getCollections,
    create: createCollection
  }
}

module.exports = createCollectionsModel
