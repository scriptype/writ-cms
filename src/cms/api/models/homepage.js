const { writeFile } = require('fs/promises')
const { join } = require('path')
const frontMatter = require('front-matter')
const { contentRootPath, omitResolvedLinks } = require('../helpers')

const helpers = {
  buildFrontMatter(metadata) {
    if (!metadata) {
      return ''
    }
    const keyValues = Object.keys(metadata)
      .map(key => {
        const actualValue = metadata[key]
        const value = Array.isArray(actualValue) ?
          actualValue.join(', ') :
          actualValue
        return `${key}: ${value}`
      })
      .join('\n')
    return ['---', keyValues, '---'].join('\n')
  }
}

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
    const frontMatter = helpers.buildFrontMatter({ title, ...metadata })
    const fileContent = [frontMatter, content].join('\n')
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
