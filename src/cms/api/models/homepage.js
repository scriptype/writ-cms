const matter = require('gray-matter')
const { writeFile } = require('fs/promises')
const { join } = require('path')
const { contentRootPath, omitResolvedLinks } = require('../helpers')

const createHomepageModel = ({ getSettings, getContentModel }) => {
  const createHomepage = async ({
    title,
    content,
    extension,
    metadata
  }) => {
    const { rootDirectory, contentDirectory } = getSettings()
    const root = await contentRootPath(rootDirectory, contentDirectory)
    const path = join(root, 'homepage')
    const fileContent = matter.stringify({
      data: { title, ...metadata },
      content: content
    })
    return writeFile(`${path}.${extension}`, fileContent)
  }

  const updateHomepage = async ({
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
      extension: extension || '',
      metadata: metadata || {}
    }

    const homepage = getContentModel().subtree.homepage

    const metadataWithTitle = {
      ...opts.metadata,
      title: `${opts.title}`
    }

    const fileContent = matter.stringify({
      data: metadataWithTitle,
      content: opts.content,
      excerpt: opts.excerpt
    })

    const isFoldered = !homepage.extension
    const targetPath = isFoldered ?
      join(homepage.absolutePath, homepage.indexFile.name) :
      homepage.absolutePath

    await writeFile(targetPath, fileContent)

    return {}
  }

  const getHomepage = () => {
    return omitResolvedLinks(getContentModel().subtree.homepage)
  }

  return {
    create: createHomepage,
    update: updateHomepage,
    get: getHomepage
  }
}

module.exports = createHomepageModel
