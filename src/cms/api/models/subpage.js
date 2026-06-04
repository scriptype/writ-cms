const matter = require('gray-matter')
const { ['default']: filenamify } = require('filenamify')
const { unusedFilename } = require('unused-filename')
const { writeFile, mkdir } = require('fs/promises')
const { join } = require('path')
const { contentRootPath, omitResolvedLinks } = require('../helpers')

const createSubpageModel = ({ getSettings, getContentModel }) => {
  const createSubpage = async ({
    title,
    content,
    excerpt,
    extension,
    metadata,
    localAssets
  }) => {
    const opts = {
      title: title || 'Untitled',
      content: content || '',
      excerpt: excerpt || '',
      extension: extension || 'md',
      metadata: metadata || {},
      localAssets: localAssets || []
    }

    const { rootDirectory, pagesDirectory, contentDirectory } = getSettings()
    const root = await contentRootPath(rootDirectory, contentDirectory)

    const sanitizedTitle = filenamify(opts.title)

    const path = join(root, pagesDirectory, sanitizedTitle)
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
    return writeFile(`${join(unusedPath, 'page')}.${opts.extension}`, fileContent)
  }

  const getSubpage = (title) => {
    const subpages = omitResolvedLinks(getContentModel().subtree.subpages)
    return subpages.find(p => p.title === title)
  }

  return {
    create: createSubpage,
    get: getSubpage
  }
}

module.exports = createSubpageModel
