const { rm, cp, mkdir } = require('fs/promises')
const { resolve, join, basename } = require('path')
const { exec } = require('child_process')
const { getSlug } = require('../helpers')
const { mode, theme, exportDirectory, assetsDirectory, out } = require('../settings').getSettings()
const Debug = require('../debug')
const { finaliseAssets } = require('../routines')

const createSiteDir = async () => {
  Debug.debugLog('create site directory')
  if (!exportDirectory || exportDirectory === '.' || exportDirectory === './' || exportDirectory === '..' || exportDirectory === '../' || exportDirectory === '/' || exportDirectory === '~') {
    throw new Error(`Dangerous export directory: "${exportDirectory}". Won't continue.`)
  }
  try {
    await rm(out, { recursive: true })
  }
  catch (ENOENT) {}
  finally {
    return mkdir(out)
  }
}

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
    src: join(__dirname, '..', '..', 'packages', `theme-${theme}`, 'assets'),
    dest: theme
  })
}

const copyCommonAssets = () => {
  Debug.debugLog('copy theme assets')
  return copyAssetsDirectory({
    src: join(__dirname, '..', 'common-assets'),
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
  scaffold: Promise.resolve(true),
  scaffoldSite() {
    Debug.debugLog('scaffolding')
    this.scaffold = this.scaffold
      .then(createSiteDir)
      .then(ensureAssetsDirectory)
      .then(copyThemeAssets)
      .then(copyExpandedAssets)
      .then(() => {
        if (mode === 'build') {
          return copyCommonAssets()
        }
        Debug.debugLog('⚠️  Skipping copying common assets in watch mode.')
        return Promise.resolve()
      })

    return this.scaffold
  }
}
