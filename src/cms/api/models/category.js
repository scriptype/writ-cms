const { writeFile, mkdir, readdir } = require('fs/promises')
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

const createCategoryModel = ({ getSettings, getContentModel }) => {
  const createCategory = async ({
    name,
    content,
    extension,
    metadata,
    localAssets
  }) => {
    const { rootDirectory, contentDirectory } = getSettings()
    const root = await contentRootPath(rootDirectory, contentDirectory)
    const path = join(root, name)
    await mkdir(path)
    if (metadata || content) {
      const frontMatter = helpers.buildFrontMatter(metadata)
      const fileContent = [frontMatter, content].join('\n')
      return writeFile(join(path, `category${extension || '.md'}`), fileContent)
    }
  }

  const getCategory = (name) => {
    return getContentModel().categories.find(c => c.name === name)
  }

  return {
    create: createCategory,
    get: getCategory
  }
}

module.exports = createCategoryModel
