const matter = require('gray-matter')
const { writeFile } = require('fs/promises')
const { join } = require('path')
const { contentRootPath, omitResolvedLinks } = require('../helpers')

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
    const fileContent = matter.stringify({
      data: { title, ...metadata },
      content: content
    })
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
