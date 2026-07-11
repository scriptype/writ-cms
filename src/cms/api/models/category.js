const matter = require('gray-matter')
const _ = require('lodash')
const { ['default']: filenamify } = require('filenamify')
const { unusedFilename } = require('unused-filename')
const { writeFile, mkdir, rename, rm } = require('fs/promises')
const { join, relative, sep } = require('path')
const {
  contentRootPath,
  replaceFilename,
  uploadAttachments,
  deleteAttachments,
  validatePath
} = require('../helpers')

const getDeepCategory = (contentModel, path) => {
  const _recurse = (containerNode, pathSegments) => {
    const child = containerNode.find(childNode => {
      if (!childNode.path) {
        return false
      }
      const childPathSegments = childNode.path.split(sep)
      return childPathSegments[childPathSegments.length - 1] === pathSegments[0]
    })
    if (pathSegments.length === 1) {
      return child
    }
    return _recurse(child.subtree.categories, pathSegments.slice(1))
  }

  return _recurse(contentModel.subtree.collections, path.split(sep))
}

const createCategoryModel = ({ getSettings, getContentModel }) => {
  const createCategory = async (data, attachments) => {
    const opts = {
      taxonomyPath: data.taxonomyPath || [],
      title: data.title || 'Untitled',
      content: data.content || '',
      excerpt: data.excerpt || '',
      extension: data.extension || 'md',
      deletedAttachments: data.deletedAttachments || [],
      metadata: _(data)
        .omit(['taxonomyPath', 'title', 'content', 'excerpt', 'extension', 'deletedAttachments'])
        .pickBy(value => (!!value || value === 0))
        .value()
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
    return Promise.all([
      writeFile(`${join(unusedPath, 'category')}.${opts.extension}`, fileContent),
      ...uploadAttachments(attachments, unusedPath)
    ])
  }

  const updateCategory = async (path, data, attachments) => {
    if (!path) {
      throw new Error('path is required')
    }

    const opts = {
      title: data.title || 'Untitled',
      content: data.content || '',
      excerpt: data.excerpt || '',
      extension: data.extension || '',
      deletedAttachments: data.deletedAttachments || [],
      metadata: _(data)
        .omit(['title', 'content', 'excerpt', 'extension', 'deletedAttachments'])
        .pickBy(value => (!!value || value === 0))
        .value()
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
    } : opts.metadata

    const fileContent = matter.stringify({
      data: metadataWithTitle,
      content: opts.content,
      excerpt: opts.excerpt
    })

    const targetPath = join(absolutePath, category.indexFile.name)

    await Promise.all([
      writeFile(targetPath, fileContent),
      (async () => {
        await Promise.all(deleteAttachments(opts.deletedAttachments, absolutePath))
        await Promise.all(uploadAttachments(attachments, absolutePath))
      })()
    ])

    const { rootDirectory, contentDirectory } = getSettings()
    const root = await contentRootPath(rootDirectory, contentDirectory)

    return {
      path: relative(root, absolutePath)
    }
  }

  const deleteCategory = async (path) => {
    if (!path) {
      throw new Error('path is required')
    }

    const category = getDeepCategory(getContentModel(), path)

    if (!category) {
      throw new Error('category not found')
    }

    const isPagePathValid = await validatePath(getSettings(), category.absolutePath)
    if (!isPagePathValid) {
      throw new Error('invalid category path')
    }

    await rm(category.absolutePath, { recursive: true, force: true })
  }

  return {
    create: createCategory,
    update: updateCategory,
    delete: deleteCategory
  }
}

module.exports = createCategoryModel
