const { rm, cp, mkdir } = require('fs/promises')
const { resolve, join } = require('path')
const { exec } = require('child_process')
const { getSlug, isDirectory } = require('./helpers')
const {
  mode,
  theme,
  exportDirectory,
  assetsDirectory,
  out
} = require('./settings').getSettings()

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

const ensureAssetsDirectory = async () => {
  const assetsDirectoryExists = await isDirectory(join(out, assetsDirectory))
  if (!assetsDirectoryExists) {
    await mkdir(join(out, assetsDirectory))
  }
}

const copyAssets = async ({ src, dest }) => {
  await ensureAssetsDirectory()
  return cp(src, join(out, assetsDirectory, dest), { recursive: true })
}

const copyThemeAssets = () =>
  copyAssets({
    src: join(__dirname, 'rendering', 'themes', theme, 'assets'),
    dest: theme
  })

const copyPreviewAssets = () =>
  copyAssets({
    src: join(__dirname, 'preview', 'static'),
    dest: 'preview'
  })

module.exports = {
  scaffold: Promise.resolve(true),
  async scaffoldSite() {
    this.scaffold = this.scaffold
      .then(createSiteDir)
      .then(copyThemeAssets)
      .then(mode === 'start' ? copyPreviewAssets :_=>_)

    return this.scaffold
  }
}
