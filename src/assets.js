const { cp, mkdir } = require('fs/promises')
const { resolve, join, basename } = require('path')
const { mode, theme, assetsDirectory, out } = require('./settings').getSettings()
const Debug = require('./debug')
const { finaliseAssets } = require('./routines')

const ensureDirectory = async (path) => {
  Debug.debugLog('ensure directory', path)
  try {
    return await mkdir(path)
  } catch (e) { } finally {
    return Promise.resolve()
  }
}

const ensureAssetsDirectory = () => {
  Debug.debugLog('ensure assets directory')
  return ensureDirectory(join(out, assetsDirectory))
}

const copyAssetsDirectory = ({ src, dest }) => {
  Debug.debugLog('copy assets directory', src, dest)
  return cp(src, join(out, assetsDirectory, dest), { recursive: true })
}

const copyAsset = async ({ src, dest }) => {
  Debug.debugLog('copy asset', src, dest)
  const targetDirectory = join(out, assetsDirectory, dest)
  await ensureDirectory(targetDirectory)
  return cp(src, join(targetDirectory, basename(src)))
}

const copyThemeAssets = () => {
  Debug.debugLog('copy theme assets')
  return copyAssetsDirectory({
    src: join(__dirname, '..', 'packages', `theme-${theme}`, 'assets'),
    dest: theme
  })
}

const copyCommonAssets = () => {
  Debug.debugLog('copy common assets')
  return copyAssetsDirectory({
    src: join(__dirname, 'common', 'assets'),
    dest: 'common'
  })
}

const copyExpandedAssets = async () => {
  Debug.debugLog('copy expanded assets')
  const finalAssets = await finaliseAssets([])
  return await Promise.all(
    finalAssets.map((assetEntry) => {
      if (assetEntry.single) {
        return copyAsset(assetEntry)
      } else {
        return copyAssetsDirectory(assetEntry)
      }
    })
  )
}

module.exports = {
  promise: Promise.resolve(true),
  copyAssets() {
    Debug.debugLog('copying assets')
    this.promise = this.promise
      .then(ensureAssetsDirectory)
      .then(() => {
        if (mode === 'build') {
          return copyCommonAssets()
        }
        Debug.debugLog('⚠️  Skipping copying common assets in watch mode.')
        return Promise.resolve()
      })
      .then(copyThemeAssets)
      .then(copyExpandedAssets)

    return this.promise
  }
}
