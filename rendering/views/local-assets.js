const { cp } = require('fs/promises')
const { join, dirname } = require('path')
const Settings = require('../../settings')
const { getSlug } = require('../../helpers')
const { debugLog } = require('../../debug')

const all = Promise.all.bind(Promise)

const copyAsset = ({ path, name }) => {
  const { rootDirectory, out } = Settings.getSettings()
  const dirnameSlug = getSlug(dirname(path))
  const newPath = join(out, join(dirnameSlug, name))
  debugLog('copying:', newPath)
  return cp(join(rootDirectory, path), newPath)
}

const copyLocalAssets = ({ localAssets, posts, categories }) => {
  const copyRootAssets = all(
    localAssets.map(copyAsset)
  )

  const copyCategoryAssets = all(
    categories.map(({ localAssets }) => {
      return all(localAssets.map(copyAsset))
    })
  )

  const copyPostAssets = all(
    posts.map(({ localAssets = [] }) => {
      return all(localAssets.map(copyAsset))
    })
  )

  return all([
    copyRootAssets,
    copyCategoryAssets,
    copyPostAssets
  ])
}

module.exports = copyLocalAssets
