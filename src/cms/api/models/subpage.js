const matter = require('gray-matter')
const { writeFile, mkdir } = require('fs/promises')
const { join } = require('path')
const { contentRootPath, omitResolvedLinks } = require('../helpers')

const createSubpageModel = ({ getSettings, getContentModel }) => {
  const createSubpage = async ({
    title,
    content,
    extension,
    category,
    metadata,
    localAssets
  }) => {
    const { rootDirectory, pagesDirectory, contentDirectory } = getSettings()
    const root = await contentRootPath(rootDirectory, contentDirectory)
    const path = join(root, pagesDirectory, title)
    const fileContent = matter.stringify({
      data: metadata,
      content: content
    })
    try {
      await mkdir(path, { recursive: true })
    } catch {}
    return writeFile(`${join(path, 'page')}.${extension}`, fileContent)
  }

  const getSubpage = (title) => {
    const subpages = omitResolvedLinks(getContentModel().subtree.subpages)
    return subpages.find(p => p.title === title)
  }

  return {
    create: createSubpage,
    get: getSubpage
  }
}

module.exports = createSubpageModel
