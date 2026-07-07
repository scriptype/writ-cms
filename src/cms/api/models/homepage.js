const matter = require('gray-matter')
const _ = require('lodash')
const { writeFile, rm } = require('fs/promises')
const { join } = require('path')
const { contentRootPath, omitResolvedLinks } = require('../helpers')

const createHomepageModel = ({ getSettings, getContentModel }) => {
  const createHomepage = async (data, attachments) => {
    const opts = {
      title: data.title || 'Untitled',
      content: data.content || '',
      excerpt: data.excerpt || '',
      extension: data.extension || '.md',
      deletedAttachments: data.deletedAttachments || [],
      metadata: _(data)
        .omit(['title', 'content', 'excerpt', 'extension', 'deletedAttachments'])
        .pickBy(value => (!!value || value === 0))
        .value()
    }

    const { rootDirectory, contentDirectory } = getSettings()
    const root = await contentRootPath(rootDirectory, contentDirectory)

    const path = join(root, 'home')
    const fileContent = matter.stringify({
      data: opts.metadata,
      content: opts.content,
      excerpt: opts.excerpt
    })
    return writeFile(`${path}.${opts.extension}`, fileContent)
  }

  const updateHomepage = async (data, attachments) => {
    const opts = {
      title: data.title || 'Untitled',
      content: data.content || '',
      excerpt: data.excerpt || '',
      extension: data.extension || '.md',
      deletedAttachments: data.deletedAttachments || [],
      metadata: _(data)
        .omit(['title', 'content', 'excerpt', 'extension', 'deletedAttachments'])
        .pickBy(value => (!!value || value === 0))
        .value()
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

    // system-generated home
    if (!homepage.path) {
      const { rootDirectory, contentDirectory } = getSettings()
      const root = await contentRootPath(rootDirectory, contentDirectory)
      const targetPath = join(root, `home${opts.extension}`)
      await writeFile(targetPath, fileContent)
      return {}
    }

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
