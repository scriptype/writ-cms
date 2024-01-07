const { cp, stat } = require('fs/promises')
const { join, dirname } = require('path')
const Settings = require('../../../settings')
const { getSlug } = require('../../../helpers')
const { debugLog } = require('../../../debug')

const all = Promise.all.bind(Promise)

const getBasePath = async () => {
  const { rootDirectory, contentDirectory } = Settings.getSettings()
  try {
    await stat(join(rootDirectory, contentDirectory))
    return join(rootDirectory, contentDirectory)
  } catch (ENOENT) {
    return rootDirectory
  }
}

const withBasePath = (basePath) => (asset) => ({ ...asset, basePath })

const copyAsset = ({ basePath, path, name, isFolder }) => {
  const { out } = Settings.getSettings()
  const dirnameSlug = getSlug(dirname(path))
  const outPath = join(out, join(dirnameSlug, name))
  debugLog('copying:', path)
  return cp(join(basePath, path), outPath, { recursive: !!isFolder })
}

const copyLocalAssets = async ({ localAssets, posts, categories }) => {
  const basePath = await getBasePath()

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
