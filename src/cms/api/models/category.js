const matter = require('gray-matter')
const { ['default']: filenamify } = require('filenamify')
const { unusedFilename } = require('unused-filename')
const { writeFile, mkdir, rename } = require('fs/promises')
const { join, dirname, basename, relative } = require('path')
const { contentRootPath } = require('../helpers')

const replaceFilename = (oldAbsolutePath, newAbsolutePath) => {
  return join(
    dirname(oldAbsolutePath),
    basename(newAbsolutePath)
  )
}

const getDeepCategory = (contentModel, path) => {
  const _recurse = (containerNode, pathSegments) => {
    const child = containerNode.find(childNode => {
      if (!childNode.path) {
        return false
      }
      const childPathSegments = childNode.path.split('/')
      return childPathSegments[childPathSegments.length - 1] === pathSegments[0]
    })
    if (pathSegments.length === 1) {
      return child
    }
    return _recurse(child.subtree.categories, pathSegments.slice(1))
  }

  return _recurse(contentModel.subtree.collections, path.split('/'))
}

const createCategoryModel = ({ getSettings, getContentModel }) => {
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

  const updateCategory = async ({
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

    const category = getDeepCategory(getContentModel(), path)

    const isTitleDifferent = opts.title !== category.title
    let absolutePath = category.absolutePath
    let isPathDifferentThanTitle

    if (isTitleDifferent) {
      const sanitizedTitle = filenamify(opts.title)
      const sanitizedPath = replaceFilename(category.absolutePath, sanitizedTitle)
      const unusedPath = await unusedFilename(sanitizedPath)

      await rename(category.absolutePath, unusedPath)

      isPathDifferentThanTitle = (sanitizedTitle !== opts.title) || (unusedPath !== sanitizedPath)
      absolutePath = unusedPath
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

    const targetPath = join(absolutePath, category.indexFile.name)

    await writeFile(targetPath, fileContent)

    const { rootDirectory, contentDirectory } = getSettings()
    const root = await contentRootPath(rootDirectory, contentDirectory)

    return {
      path: relative(root, absolutePath)
    }
  }

  return {
    create: createCategory,
    update: updateCategory
  }
}

module.exports = createCategoryModel
