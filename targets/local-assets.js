const { cp } = require('fs/promises')
const { join, dirname } = require('path')
const { paths } = require('../settings')
const { getSlug } = require('../helpers')

const copyAsset = ({ path, name }) => {
  const dirnameSlug = getSlug(dirname(path))
  const newPath = join(paths.SITE, join(dirnameSlug, name))
  console.log('copying:', newPath)
  return cp(path, newPath)
}

const copyLocalAssets = ({ localAssets, posts, categories }) => {
  const copyRootAssets = Promise.all(
    localAssets.map(copyAsset)
  )

  const copyCategoryAssets = Promise.all(
    categories.map(({ data: { localAssets } }) => {
      return localAssets.map(copyAsset)
    })
  )

  const copyPostAssets = Promise.all(
    posts.map(({ data: { localAssets = [] } }) => {
      return localAssets.map(copyAsset)
    })
  )

  return Promise.all([
    copyRootAssets,
    copyCategoryAssets,
    copyPostAssets
  ])
}

module.exports = {
  copy: copyLocalAssets
}
