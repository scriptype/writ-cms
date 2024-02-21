const { writeFile, mkdir } = require('fs/promises')
const { join } = require('path')
const frontMatter = require('front-matter')
const { contentRootPath } = require('../helpers')

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
    const frontMatter = helpers.buildFrontMatter(metadata)
    const fileContent = [frontMatter, content].join('\n')
    if (localAssets.length) {
      await mkdir(path, { recursive: true })
      return writeFile(join(path, `page.${extension}`), fileContent)
    }
    return writeFile(`${path}.${extension}`, fileContent)
  }

  const getSubpage = (title) => {
    return getContentModel().subpages.find(p => p.title === title)
  }

  return {
    create: createSubpage,
    get: getSubpage
  }
}

module.exports = createSubpageModel
