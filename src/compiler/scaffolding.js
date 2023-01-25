const { rm, cp, mkdir } = require('fs/promises')
const { resolve, join, basename } = require('path')
const { exec } = require('child_process')
const { getSlug } = require('../helpers')
const { theme, exportDirectory, assetsDirectory, out } = require('../settings').getSettings()
const { finaliseAssets } = require('../routines')

const createSiteDir = async () => {
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
  try {
    return await mkdir(path)
  } catch (e) { } finally {
    return Promise.resolve()
  }
}

const ensureAssetsDirectory = () => ensureDirectory(join(out, assetsDirectory))

const copyAssetsDirectory = ({ src, dest }) => {
  return cp(src, join(out, assetsDirectory, dest), { recursive: true })
}

const copyAsset = async ({ src, dest }) => {
  const targetDirectory = join(out, assetsDirectory, dest)
  try {
    await ensureDirectory(targetDirectory)
  } catch (e) {} finally {
    return cp(src, join(targetDirectory, basename(src)))
  }
}

const copyThemeAssets = () =>
  copyAssetsDirectory({
    src: join(__dirname, '..', '..', 'packages', `theme-${theme}`, 'assets'),
    dest: theme
  })

const copyExpandedAssets = async () => {
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
    this.scaffold = this.scaffold
      .then(createSiteDir)
      .then(ensureAssetsDirectory)
      .then(copyThemeAssets)
      .then(copyExpandedAssets)

    return this.scaffold
  }
}
