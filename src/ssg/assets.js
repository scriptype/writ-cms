const { stat, cp } = require('fs/promises')
const { join, basename } = require('path')
const Settings = require('./settings')
const Debug = require('./debug')
const { decorate } = require('./decorations')

const getBasePath = async () => {
  const { rootDirectory, contentDirectory } = Settings.getSettings()
  try {
    await stat(join(rootDirectory, contentDirectory))
    return join(rootDirectory, contentDirectory)
  } catch {
    return rootDirectory
  }
}

const copyAssetsDirectory = async () => {
  const { assetsDirectory, out } = Settings.getSettings()
  const src = join(await getBasePath(), assetsDirectory)
  try {
    const dest = join(out, assetsDirectory)
    return await cp(src, dest, { recursive: true, force: true })
  } catch (e) {
    if (e.code === 'ENOENT') {
      Debug.debugLog('copyAssetsDirectory: assets directory not found')
      return Promise.resolve()
    }
    console.log('copyAssetsDirectory error', e)
    throw e
  }
}

const copyAssetsAsFolder = async ({ src, dest }) => {
  Debug.debugLog('copy assets directory', src, dest)
  const { out, assetsDirectory } = Settings.getSettings()
  try {
    await cp(src, join(out, assetsDirectory, dest), { recursive: true, force: true })
  } catch (e) {
    if (e.code === 'ENOENT') {
      Debug.debugLog(`copyAssetsAsFolder: ${src} not found`)
      return Promise.resolve()
    }
    if (e.code === 'EEXIST') {
      Debug.debugLog(`copyAssetsAsFolder: ${src} already exists`)
      return Promise.resolve()
    }
    console.log('copyAssetsAsFolder error', e)
    throw e
  }
}

const copyAsset = async ({ src, dest, rename }) => {
  Debug.debugLog('copy asset', src, dest)
  const { out, assetsDirectory } = Settings.getSettings()
  const targetDirectory = join(out, assetsDirectory, dest)
  if (rename) {
    return cp(src, join(targetDirectory, rename), { recursive: true, force: true })
  }
  return cp(src, join(targetDirectory, basename(src)), { recursive: true, force: true })
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
    this.promise = this.promise
      .then(copyAssetsDirectory)
      .then(() => decorateAssets())

    return this.promise.then(() => {
      Debug.timeEnd('assets')
    })
  }
}
