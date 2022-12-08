const { cp } = require('fs/promises')
const { join, dirname } = require('path')
const { paths } = require('../../settings')
const { getSlug } = require('../../helpers')

const all = Promise.all.bind(Promise)

const copyAsset = ({ path, name }) => {
  const dirnameSlug = getSlug(dirname(path))
  const newPath = join(paths.out, join(dirnameSlug, name))
  console.log('copying:', newPath)
  return cp(path, newPath)
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
