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

const findPage = (contentModel, path) => {
  return contentModel.subtree.subpages.find(p => p.path === path)
}

const getRelativePath = async (settings, absolutePath) => {
  const { rootDirectory, contentDirectory } = settings
  const root = await contentRootPath(rootDirectory, contentDirectory)

  return relative(root, absolutePath)
}

const createSubpageModel = ({ getSettings, getContentModel }) => {
  const createSubpage = async (data, attachments) => {
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

    const { rootDirectory, pagesDirectory, contentDirectory } = getSettings()
    const root = await contentRootPath(rootDirectory, contentDirectory)

    const shouldFolder = !!attachments.length
    const sanitizedTitle = filenamify(opts.title)

    const path = join(
      root,
      pagesDirectory,
      shouldFolder ? sanitizedTitle : `${sanitizedTitle}${opts.extension}`
    )
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

    if (attachments.length) {
      try {
        await mkdir(unusedPath, { recursive: true })
      } catch {}
      await Promise.all([
        writeFile(join(unusedPath, `page${opts.extension}`), fileContent),
        ...uploadAttachments(attachments, unusedPath)
      ])
    } else {
      await writeFile(unusedPath, fileContent)
    }

    return {
      path: await getRelativePath(getSettings(), unusedPath)
    }
  }

  const updatePage = async (path, data, attachments = []) => {
    if (!path) {
      throw new Error('path is required')
    }

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

    const page = findPage(getContentModel(), path)

    const isFoldered = !page.extension
    const shouldFolder = !!attachments.length || (page.subtree.attachments.length > opts.deletedAttachments.length)

    // When foldering changes, just re-create page and delete the old one
    if (isFoldered !== shouldFolder) {
      const result = await createSubpage(data, attachments)
      await rm(page.absolutePath, { recursive: true, force: true })
      return result
    }

    const isTitleDifferent = opts.title !== page.title
    let absolutePath = page.absolutePath
    let isPathDifferentThanTitle

    if (isTitleDifferent) {
      const sanitizedTitle = filenamify(opts.title)
      const sanitizedPath = replaceFilename(page.absolutePath, sanitizedTitle)
      const unusedPath = await unusedFilename(sanitizedPath)

      if (isFoldered) {
        await rename(page.absolutePath, unusedPath)
      } else {
        await rm(page.absolutePath)
      }

      isPathDifferentThanTitle = (sanitizedTitle !== opts.title) || (unusedPath !== sanitizedPath)
      absolutePath = isFoldered ? unusedPath : `${unusedPath}${opts.extension || page.extension}`
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

    const targetPath = isFoldered ?
      join(absolutePath, page.indexFile.name) :
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

  const getSubpage = (title) => {
    const subpages = omitResolvedLinks(getContentModel().subtree.subpages)
    return subpages.find(p => p.title === title)
  }

  return {
    create: createSubpage,
    update: updatePage,
    get: getSubpage
  }
}

module.exports = createSubpageModel
