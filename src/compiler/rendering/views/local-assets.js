const { cp } = require('fs/promises')
const { join, dirname } = require('path')
const Settings = require('../../../settings')
const { contentRoot, getSlug } = require('../../../helpers')
const { debugLog } = require('../../../debug')

const all = Promise.all.bind(Promise)

const withBasePath = (basePath) => (asset) => ({ ...asset, basePath })

const copyAsset = ({ basePath, path, name, isFolder }) => {
  const { out } = Settings.getSettings()
  const dirnameSlug = getSlug(dirname(path))
  const outPath = join(out, join(dirnameSlug, name))
  debugLog('copying:', path)
  return cp(join(basePath, path), outPath, { recursive: !!isFolder })
}

const copyLocalAssets = async ({ localAssets, posts, categories }) => {
  const { rootDirectory, contentDirectory } = Settings.getSettings()
  const basePath = await contentRoot(rootDirectory, contentDirectory)

  const copyRootAssets = all(
    localAssets
      .map(withBasePath(basePath))
      .map(copyAsset)
  )

  const copyCategoryAssets = all(
    categories.map(({ localAssets }) => {
      return all(
        localAssets
          .map(withBasePath(basePath))
          .map(copyAsset)
      )
    })
  )

  const copyPostAssets = all(
    posts.map(({ localAssets = [] }) => {
      return all(
        localAssets
          .map(withBasePath(basePath))
          .map(copyAsset)
      )
    })
  )

  return all([
    copyRootAssets,
    copyCategoryAssets,
    copyPostAssets
  ])
}

module.exports = copyLocalAssets
