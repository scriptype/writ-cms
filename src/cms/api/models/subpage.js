const { writeFile, mkdir } = require('fs/promises')
const { join } = require('path')
const frontMatter = require('front-matter')
const { contentRootPath, omitResolvedLinks, buildFrontMatter } = require('../helpers')

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
    const frontMatter = buildFrontMatter(metadata)
    const fileContent = [frontMatter, content].join('\n').trim()
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
