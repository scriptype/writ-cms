const matter = require('gray-matter')
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

const createSubpageModel = ({ getSettings, getContentModel }) => {
  const createSubpage = async ({
    title,
    content,
    excerpt,
    extension,
    metadata,
    localAssets
  }) => {
    const opts = {
      title: title || 'Untitled',
      content: content || '',
      excerpt: excerpt || '',
      extension: extension || 'md',
      metadata: metadata || {},
      localAssets: localAssets || []
    }

    const { rootDirectory, pagesDirectory, contentDirectory } = getSettings()
    const root = await contentRootPath(rootDirectory, contentDirectory)

    const sanitizedTitle = filenamify(opts.title)

    const path = join(root, pagesDirectory, sanitizedTitle)
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
    return writeFile(`${join(unusedPath, 'page')}.${opts.extension}`, fileContent)
  }

  const updatePage = async ({
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

    const page = getContentModel().subtree.subpages.find(p => p.path === path)

    const isFoldered = !page.extension
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
    } : metadata

    const fileContent = matter.stringify({
      data: metadataWithTitle,
      content: opts.content,
      excerpt: opts.excerpt
    })

    const targetPath = isFoldered ?
      join(absolutePath, page.indexFile.name) :
      absolutePath

    await writeFile(targetPath, fileContent)

    const { rootDirectory, contentDirectory } = getSettings()
    const root = await contentRootPath(rootDirectory, contentDirectory)

    return {
      path: relative(root, absolutePath)
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
