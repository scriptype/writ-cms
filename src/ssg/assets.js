const { stat, cp, mkdir } = require('fs/promises')
const { resolve, join, basename } = require('path')
const Settings = require('./settings')
const Debug = require('./debug')
const { decorate } = require('./decorations')
const { ensureDirectory } = require('./lib/fileSystemHelpers')

const getBasePath = async () => {
  const { rootDirectory, contentDirectory } = Settings.getSettings()
  try {
    await stat(join(rootDirectory, contentDirectory))
    return join(rootDirectory, contentDirectory)
  } catch (ENOENT) {
    return rootDirectory
  }
}

const ensureAssetsDirectory = () => {
  const { out, assetsDirectory } = Settings.getSettings()
  Debug.debugLog('ensure assets directory', join(out, assetsDirectory))
  return ensureDirectory(join(out, assetsDirectory))
}

const copyAssetsDirectory = async () => {
  const { assetsDirectory, out } = Settings.getSettings()
  const src = join(await getBasePath(), assetsDirectory)
  try {
    await stat(src)
    const dest = join(out, assetsDirectory)
    return cp(src, dest, { recursive: true })
  } catch {
    return Promise.resolve()
  }
}

const copyAssetsAsFolder = async ({ src, dest }) => {
  Debug.debugLog('copy assets directory', src, dest)
  const { out, assetsDirectory } = Settings.getSettings()
  try {
    await stat(src)
  } catch (e) {
    Debug.debugLog(`copyAssetsAsFolder: ${src} not found`)
    return Promise.resolve()
  }
  return cp(src, join(out, assetsDirectory, dest), { recursive: true })
}

const copyAsset = async ({ src, dest, rename }) => {
  Debug.debugLog('copy asset', src, dest)
  const { out, assetsDirectory } = Settings.getSettings()
  const targetDirectory = join(out, assetsDirectory, dest)
  Debug.debugLog('ensure directory', targetDirectory)
  await ensureDirectory(targetDirectory)
  if (rename) {
    return cp(src, join(targetDirectory, rename))
  }
  return cp(src, join(targetDirectory, basename(src)))
}

const decorateAssets = async () => {
  Debug.debugLog('copy expanded assets')
  const decoratedAssets = await decorate('assets', [])
  return Promise.all(
    decoratedAssets.map((assetEntry) => {
      if (assetEntry.single) {
        return copyAsset(assetEntry)
      } else {
        return copyAssetsAsFolder(assetEntry)
      }
    })
  )
}

module.exports = {
  promise: Promise.resolve(true),
  copyAssets() {
    Debug.timeStart('assets')
    Debug.debugLog('copying assets')
    const { mode } = Settings.getSettings()
    this.promise = this.promise
      .then(ensureAssetsDirectory)
      .then(copyAssetsDirectory)
      .then(() => decorateAssets())

    return this.promise.then(() => {
      Debug.timeEnd('assets')
    })
  }
}
