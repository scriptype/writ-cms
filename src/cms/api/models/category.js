const { writeFile, mkdir, readdir } = require('fs/promises')
const { join } = require('path')
const frontMatter = require('front-matter')
const { readFileContent, contentRootPath } = require('../helpers')

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

const createCategoryModel = ({ getSettings }) => {
  const { rootDirectory, contentDirectory } = getSettings()

  const createCategory = async ({
    name,
    content,
    extension,
    metadata,
    localAssets
  }) => {
    const root = await contentRootPath(rootDirectory, contentDirectory)
    const path = join(root, name)
    await mkdir(path)
    if (metadata || content) {
      const frontMatter = helpers.buildFrontMatter(metadata)
      const fileContent = [frontMatter, content].join('\n')
      return writeFile(join(path, `category${extension || '.md'}`), fileContent)
    }
  }

  const getCategory = async (name) => {
    const root = await contentRootPath(rootDirectory, contentDirectory)
    const fullPath = join(root, name)
    const dir = await readdir(fullPath)
    const posts = dir
      .filter(p => p !== 'category.md')
      .filter(p => {
        return (
          /\.(md|markdown|hbs|handlebars|txt|html)$/.test(p) ||
          !p.includes('.')
        )
      })
      .filter(Boolean)
      .map(p => p.replace(/\..+$/, ''))
    return {
      name: name.replace(/^\//, ''),
      posts
    }
  }

  return {
    create: createCategory,
    get: getCategory
  }
}

module.exports = createCategoryModel
