const { rm, cp, mkdir } = require('fs/promises')
const { resolve, join } = require('path')
const { exec } = require('child_process')
const { getSlug, isDirectory } = require('./helpers')
const {
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

const copyStaticAssets = async () => {
  const src = join(__dirname, 'rendering', 'themes', theme, 'assets')
  const dest = join(out, assetsDirectory, theme)
  if (!(await isDirectory(join(out, assetsDirectory)))) {
    await mkdir(join(out, assetsDirectory))
  }
  return cp(src, dest, { recursive: true })
}

module.exports = {
  scaffold: Promise.resolve(true),
  async scaffoldSite() {
    this.scaffold = this.scaffold
      .then(createSiteDir)
      .then(copyStaticAssets)

    return this.scaffold
  }
}
