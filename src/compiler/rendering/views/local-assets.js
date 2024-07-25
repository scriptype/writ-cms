const { cp, stat } = require('fs/promises')
const { join, dirname, sep } = require('path')
const Settings = require('../../../settings')
const { contentRoot, getSlug } = require('../../../helpers')
const { debugLog } = require('../../../debug')

const all = Promise.all.bind(Promise)

const withBasePath = (basePath) => (asset) => ({ ...asset, basePath })

const copyAsset = async ({ basePath, destPath, path, name, isFolder }) => {
  const { out } = Settings.getSettings()
  const outputDir = dirname(destPath || path)
  const dirnameSlug = outputDir === '.' ?
    outputDir :
    outputDir.split(sep).map(getSlug).join(sep)
  const outPath = join(out, join(dirnameSlug, name))
  debugLog('copying:', path)
  try {
    return await cp(join(basePath, path), outPath, { recursive: !!isFolder })
  } catch (e) {
    if (e.code === 'ENOENT') {
      debugLog('failed copying asset that no longer exists', e)
    } else {
      debugLog('failed copying asset', e)
    }
    return Promise.resolve()
  }
}

const copyLocalAssets = async ({ localAssets, homepage, posts, subpages, categories }) => {
  const { rootDirectory, contentDirectory, pagesDirectory } = Settings.getSettings()
  const basePath = await contentRoot(rootDirectory, contentDirectory)

  const copyRootAssets = all(
    localAssets
      .map(withBasePath(basePath))
      .map(copyAsset)
  )

  const copyHomepageAssets = all(
    (homepage.localAssets || []).map((localAsset) => {
      const assetWithBasePath = withBasePath(basePath)(localAsset)
      return copyAsset({
        ...assetWithBasePath,
        destPath: '.'
      })
    })
  )

  const copyCategoryAssets = all(
    (categories || []).map(({ localAssets }) => {
      return all(
        localAssets
          .map(withBasePath(basePath))
          .map(copyAsset)
      )
    })
  )

  const copyPostAssets = all(
    (posts || []).map(({ localAssets = [] }) => {
      return all(
        localAssets
          .map(withBasePath(basePath))
          .map(copyAsset)
      )
    })
  )

  const copySubpageAssets = all(
    (subpages || []).map(({ localAssets = [] }) => {
      return all(
        localAssets
          .map(withBasePath(basePath))
          .map(a => ({
            ...a,
            destPath: a.path.replace(new RegExp('^' + pagesDirectory), '')
          }))
          .map(copyAsset)
      )
    })
  )

  return all([
    copyRootAssets,
    copyHomepageAssets,
    copyCategoryAssets,
    copyPostAssets,
    copySubpageAssets
  ])
}

module.exports = copyLocalAssets
