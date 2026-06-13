const { writeFile, mkdir } = require('fs/promises')
const { join } = require('path')
const matter = require('gray-matter')
const { ['default']: filenamify } = require('filenamify')
const { unusedFilename } = require('unused-filename')
const { contentRootPath } = require('../helpers')

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
    return writeFile(`${join(unusedPath, 'post')}.${opts.extension}`, fileContent)
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
      extension: extension || 'md',
      metadata: metadata || {}
    }

    const collectionName = path.split('/')[0]
    const collection = getContentModel().subtree.collections.find(c => c.name === collectionName)
    const post = collection.subtree.posts.find(p => p.path === path)

    const metadataWithTitle = {
      ...opts.metadata,
      title: `${opts.title}`
    }

    const fileContent = matter.stringify({
      data: metadataWithTitle,
      content: opts.content,
      excerpt: opts.excerpt
    })

    const isFolder = !post.extension
    const targetPath = isFolder ?
      join(post.absolutePath, post.indexFile.name) :
      post.absolutePath

    return writeFile(targetPath, fileContent)
  }

  return {
    create: createPost,
    edit: editPost
  }
}

module.exports = createPostModel
