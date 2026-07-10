const { writeFile, mkdir, rename, rm } = require('fs/promises')
const { join, dirname, basename, relative, sep, isAbsolute } = require('path')
const matter = require('gray-matter')
const _ = require('lodash')
const { ['default']: filenamify } = require('filenamify')
const { unusedFilename } = require('unused-filename')
const { contentRootPath } = require('../helpers')

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

const findPost = (contentModel, path) => {
    const collectionName = path.split(sep)[0]
    const collection = contentModel.subtree.collections.find(c => c.name === collectionName)
    return collection.subtree.posts.find(p => p.path === path)
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

const createPostModel = ({ getSettings, getContentModel }) => {
  const createPost = async (data, attachments) => {
    const opts = {
      taxonomyPath: data.taxonomyPath || [],
      title: data.title || 'Untitled',
      content: data.content || '',
      excerpt: data.excerpt || '',
      extension: data.extension || '.md',
      deletedAttachments: data.deletedAttachments || [],
      metadata: _(data)
        .omit(['taxonomyPath', 'title', 'content', 'excerpt', 'extension', 'deletedAttachments'])
        .pickBy(value => (!!value || value === 0))
        .value()
    }

    const { rootDirectory, contentDirectory } = getSettings()
    const root = await contentRootPath(rootDirectory, contentDirectory)

    const shouldFolder = !!attachments.length
    const sanitizedTitle = filenamify(opts.title)

    const path = join(...[
      root,
      ...opts.taxonomyPath,
      shouldFolder ? sanitizedTitle : `${sanitizedTitle}${opts.extension}`
    ])
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
        writeFile(join(unusedPath, `post${opts.extension}`), fileContent),
        ...uploadAttachments(attachments, unusedPath)
      ])
    } else {
      await writeFile(unusedPath, fileContent)
    }

    return {
      path: await getRelativePath(getSettings(), unusedPath)
    }
  }

  const updatePost = async (path, data, attachments = []) => {
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

    const post = findPost(getContentModel(), path)

    const isFoldered = !post.extension
    const shouldFolder = !!attachments.length || (post.subtree.attachments.length > opts.deletedAttachments.length)

    // When foldering changes, just re-create post and delete the old one
    if (isFoldered !== shouldFolder) {
      const result = await createPost({
        ...data,
        taxonomyPath: path.split(sep).slice(0, -1),
      }, attachments)
      await rm(post.absolutePath, { recursive: true, force: true })
      return result
    }

    const isTitleDifferent = opts.title !== post.title
    let absolutePath = post.absolutePath
    let isPathDifferentThanTitle

    if (isTitleDifferent) {
      const sanitizedTitle = filenamify(opts.title)
      const sanitizedPath = replaceFilename(post.absolutePath, sanitizedTitle)
      const unusedPath = await unusedFilename(sanitizedPath)

      if (isFoldered) {
        await rename(post.absolutePath, unusedPath)
      } else {
        await rm(post.absolutePath)
      }

      isPathDifferentThanTitle = (sanitizedTitle !== opts.title) || (unusedPath !== sanitizedPath)
      absolutePath = isFoldered ? unusedPath : `${unusedPath}${opts.extension || post.extension}`
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
      join(absolutePath, post.indexFile.name) :
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

  const deletePost = async (path) => {
    if (!path) {
      throw new Error('path is required')
    }

    const post = findPost(getContentModel(), path)

    if (!post) {
      throw new Error('post not found')
    }

    const isPostPathValid = await validatePath(getSettings(), post.absolutePath)
    if (!isPostPathValid) {
      throw new Error('invalid post path')
    }

    await rm(post.absolutePath, { recursive: true, force: true })
  }

  return {
    create: createPost,
    update: updatePost,
    delete: deletePost
  }
}

module.exports = createPostModel
