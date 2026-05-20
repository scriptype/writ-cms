const { writeFile } = require('fs/promises')
const { join } = require('path')
const frontMatter = require('front-matter')
const { contentRootPath, omitResolvedLinks, buildFrontMatter } = require('../helpers')

const createHomepageModel = ({ getSettings, getContentModel }) => {
  const createHomepage = async ({
    title,
    content,
    extension,
    metadata
  }) => {
    const { rootDirectory, contentDirectory } = getSettings()
    const root = await contentRootPath(rootDirectory, contentDirectory)
    const path = join(root, 'homepage')
    const frontMatter = buildFrontMatter({ title, ...metadata })
    const fileContent = [frontMatter, content].join('\n').trim()
    return writeFile(`${path}.${extension}`, fileContent)
  }

  const getHomepage = (handle) => {
    return omitResolvedLinks(getContentModel().subtree.homepage)
  }

  return {
    create: createHomepage,
    get: getHomepage
  }
}

module.exports = createHomepageModel
