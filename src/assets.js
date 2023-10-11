const { cp, mkdir } = require('fs/promises')
const { resolve, join, basename } = require('path')
const Settings = require('./settings')
const Debug = require('./debug')

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
  const { out, assetsDirectory } = Settings.getSettings()
  return ensureDirectory(join(out, assetsDirectory))
}

const copyAssetsDirectory = ({ src, dest }) => {
  Debug.debugLog('copy assets directory', src, dest)
  const { out, assetsDirectory } = Settings.getSettings()
  return cp(src, join(out, assetsDirectory, dest), { recursive: true })
}

const copyAsset = async ({ src, dest }) => {
  Debug.debugLog('copy asset', src, dest)
  const { out, assetsDirectory } = Settings.getSettings()
  const targetDirectory = join(out, assetsDirectory, dest)
  await ensureDirectory(targetDirectory)
  return cp(src, join(targetDirectory, basename(src)))
}

const copyThemeAssets = () => {
  Debug.debugLog('copy theme assets')
  const { theme } = Settings.getSettings()
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

const decorateAssets = (assetsDecorator) => async () => {
  Debug.debugLog('copy expanded assets')
  const finalAssets = await assetsDecorator([])
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
  copyAssets({ decorators }) {
    Debug.debugLog('copying assets')
    const { mode } = Settings.getSettings()
    this.promise = this.promise
      .then(ensureAssetsDirectory)
      .then(copyCommonAssets)
      .then(copyThemeAssets)
      .then(decorateAssets(decorators.assets))

    return this.promise
  }
}
