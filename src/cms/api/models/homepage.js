const matter = require('gray-matter')
const _ = require('lodash')
const { writeFile, mkdir, rm } = require('fs/promises')
const { join, relative, isAbsolute } = require('path')
const { contentRootPath, omitResolvedLinks } = require('../helpers')

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

const getRelativePath = async (settings, absolutePath) => {
  const { rootDirectory, contentDirectory } = settings
  const root = await contentRootPath(rootDirectory, contentDirectory)

  return relative(root, absolutePath)
}

const validatePath = async (settings, path) => {
  const relativePath = await getRelativePath(settings, path)
  const isOutsideRoot = (
    relativePath.startsWith('..') ||
    relativePath.startsWith('..\\') ||
    isAbsolute(relativePath)
  )
  const isRootItself = relativePath === ''
  return !isOutsideRoot && !isRootItself
}

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

    const metadataWithTitle = opts.title === 'Untitled' ? opts.metadata : {
      ...opts.metadata,
      title: `${opts.title}`
    }

    const fileContent = matter.stringify({
      data: metadataWithTitle,
      content: opts.content,
      excerpt: opts.excerpt
    })

    const path = join(root, 'home')

    if (attachments.length) {
      try {
        await mkdir(path, { recursive: true })
      } catch {}
      await Promise.all([
        writeFile(join(path, `index${opts.extension}`), fileContent),
        ...uploadAttachments(attachments, path)
      ])
    } else {
      await writeFile(`${path}${opts.extension}`, fileContent)
    }

    return {
      path: await getRelativePath(getSettings(), path)
    }
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

    const isSystemGenerated = !homepage.path
    const isFoldered = !homepage.extension
    const shouldFolder = !!attachments.length || (homepage.subtree.attachments.length > opts.deletedAttachments.length)

    // When foldering changes, just re-create page and delete the old one
    if (isSystemGenerated || (isFoldered !== shouldFolder)) {
      const result = await createHomepage(data, attachments)
      if (!isSystemGenerated) {
        await rm(homepage.absolutePath, { recursive: true, force: true })
      }
      return result
    }

    const metadataWithTitle = opts.title === 'Untitled' ? opts.metadata : {
      ...opts.metadata,
      title: `${opts.title}`
    }

    const fileContent = matter.stringify({
      data: metadataWithTitle,
      content: opts.content,
      excerpt: opts.excerpt
    })

    const absolutePath = homepage.absolutePath

    const targetPath = isFoldered ?
      join(absolutePath, homepage.indexFile.name) :
      absolutePath

    await Promise.all([
      writeFile(targetPath, fileContent),
      (async () => {
        await Promise.all(deleteAttachments(opts.deletedAttachments, absolutePath))
        await Promise.all(uploadAttachments(attachments, absolutePath))
      })()
    ])

    return {
      path: await getRelativePath(getSettings(), absolutePath)
    }
  }

  const getHomepage = () => {
    return omitResolvedLinks(getContentModel().subtree.homepage)
  }

  const deleteHomepage = async () => {
    const homepage = getContentModel().subtree.homepage

    if (!homepage) {
      throw new Error('home not found')
    }

    const isPagePathValid = await validatePath(getSettings(), homepage.absolutePath)
    if (!isPagePathValid) {
      throw new Error('invalid home path')
    }

    await rm(homepage.absolutePath, { recursive: true, force: true })
  }

  return {
    create: createHomepage,
    update: updateHomepage,
    get: getHomepage,
    delete: deleteHomepage
  }
}

module.exports = createHomepageModel
