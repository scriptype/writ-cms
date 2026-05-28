const matter = require('gray-matter')
const { writeFile, mkdir } = require('fs/promises')
const { join } = require('path')
const { contentRootPath, omitResolvedLinks } = require('../helpers')

const createCollectionsModel = ({ getSettings, getContentModel }) => {
  const getCollections = () => {
    return omitResolvedLinks(getContentModel().subtree.collections)
  }

  const createCollection = async ({
    title,
    content = '',
    extension = 'md',
    metadata = {}
  }) => {
    const { rootDirectory, contentDirectory } = getSettings()
    const root = await contentRootPath(rootDirectory, contentDirectory)
    const path = join(root, title)
    const fileContent = matter.stringify({
      data: metadata,
      content
    })
    try {
      await mkdir(path, { recursive: true })
    } catch {}
    return writeFile(`${join(path, 'collection')}.${extension}`, fileContent)
  }

  return {
    get: getCollections,
    create: createCollection
  }
}

module.exports = createCollectionsModel
