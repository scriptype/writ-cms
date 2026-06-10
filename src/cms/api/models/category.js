const matter = require('gray-matter')
const { ['default']: filenamify } = require('filenamify')
const { unusedFilename } = require('unused-filename')
const { writeFile, mkdir } = require('fs/promises')
const { join } = require('path')
const { contentRootPath } = require('../helpers')

const createCategoryModel = ({ getSettings }) => {
  const createCategory = async ({
    taxonomyPath,
    title,
    content,
    excerpt,
    extension,
    metadata
  }) => {
    const opts = {
      taxonomyPath: taxonomyPath || [],
      title: title || 'Untitled',
      content: content || '',
      excerpt: excerpt || '',
      extension: extension || 'md',
      metadata: metadata || {}
    }
    const { rootDirectory, contentDirectory } = getSettings()
    const root = await contentRootPath(rootDirectory, contentDirectory)

    const sanitizedTitle = filenamify(opts.title)

    const path = join(...[root].concat(opts.taxonomyPath).concat(sanitizedTitle))
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
    return writeFile(`${join(unusedPath, 'category')}.${opts.extension}`, fileContent)
  }

  return {
    create: createCategory
  }
}

module.exports = createCategoryModel
