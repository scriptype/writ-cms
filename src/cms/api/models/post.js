const { writeFile, mkdir, rename, rm } = require('fs/promises')
const { join, dirname, basename } = require('path')
const matter = require('gray-matter')
const { ['default']: filenamify } = require('filenamify')
const { unusedFilename } = require('unused-filename')
const { contentRootPath } = require('../helpers')

const replaceFilename = (oldAbsolutePath, newAbsolutePath) => {
  return join(
    dirname(oldAbsolutePath),
    basename(newAbsolutePath)
  )
}

const createPostModel = ({ getSettings, getContentModel }) => {
  const createPost = async ({
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
      extension: extension || '.md',
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
    return writeFile(`${join(unusedPath, 'post')}${opts.extension}`, fileContent)
  }

  const editPost = async ({
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

    const collectionName = path.split('/')[0]
    const collection = getContentModel().subtree.collections.find(c => c.name === collectionName)
    const post = collection.subtree.posts.find(p => p.path === path)


    const isFoldered = !post.extension
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
    } : metadata

    const fileContent = matter.stringify({
      data: metadataWithTitle,
      content: opts.content,
      excerpt: opts.excerpt
    })

    const targetPath = isFoldered ?
      join(absolutePath, post.indexFile.name) :
      absolutePath

    return writeFile(targetPath, fileContent)
  }

  return {
    create: createPost,
    edit: editPost
  }
}

module.exports = createPostModel
