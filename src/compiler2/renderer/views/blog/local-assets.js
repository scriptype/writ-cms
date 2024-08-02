const { cp, stat } = require('fs/promises')
const { join, dirname, sep } = require('path')
const Settings = require('../../../../settings')
const { contentRoot, getSlug } = require('../../../../helpers')
const { debugLog } = require('../../../../debug')

const all = Promise.all.bind(Promise)

const withBasePath = (basePath) => (asset) => ({ ...asset, basePath })

const copyAsset = ({ outputPrefix }) => async ({ basePath, destPath, path, name, isFolder, outputPrefix }) => {
  const { out } = Settings.getSettings()
  const outputDir = dirname(destPath || path)
  const dirnameSlug = outputDir === '.' ?
    outputDir :
    outputDir.split(sep).map(getSlug).join(sep)
  const outPath = join(out, outputPrefix, join(dirnameSlug, name))
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

const copyLocalAssets = async ({ localAssets, posts, subpages, categories, outputPrefix }) => {
  const { rootDirectory, contentDirectory, pagesDirectory } = Settings.getSettings()
  const basePath = join(
    await contentRoot(rootDirectory, contentDirectory),
    outputPrefix
  )

  let copyRootAssets = Promise.resolve()
  if (outputPrefix && outputPrefix !== '/' && outputPrefix !== '.') {
    copyRootAssets = all(
      localAssets
        .map(withBasePath(basePath))
        .map(copyAsset({ outputPrefix }))
    )
  }

  const copyCategoryAssets = all(
    (categories || []).map(({ localAssets }) => {
      return all(
        localAssets
          .map(withBasePath(basePath))
          .map(copyAsset({ outputPrefix }))
      )
    })
  )

  const copyPostAssets = all(
    (posts || []).map(({ localAssets = [] }) => {
      return all(
        localAssets
          .map(withBasePath(basePath))
          .map(copyAsset({ outputPrefix }))
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
