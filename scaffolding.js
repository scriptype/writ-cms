const { rm, cp, mkdir } = require('fs/promises')
const { resolve, join } = require('path')
const { exec } = require('child_process')
const { getSlug, isDirectory } = require('./helpers')
const { paths, settings } = require('./settings')

const createSiteDir = async () => {
  const path = paths.SITE || 'site'
  if (paths.SITE === '.' || paths.SITE === './' || paths.SITE === '..' || paths.SITE === '../' || paths.SITE === '/' || paths.SITE === '~') {
    throw new Error(`Dangerous export directory: "${paths.SITE}". Won't continue.`)
  }
  try {
    await rm(paths.SITE, { recursive: true })
  } catch (e) {
    console.log('createSiteDir error:', e)
  } finally {
    return mkdir(paths.SITE)
  }
}

const copyStaticAssets = async () => {
  const src = join(__dirname, 'rendering', 'assets')
  const out = join(paths.SITE, paths.ASSETS, '_')
  if (!(await isDirectory(join(paths.SITE, paths.ASSETS)))) {
    await mkdir(join(paths.SITE, paths.ASSETS))
  }
  return cp(src, out, { recursive: true })
}

module.exports = {
  async scaffoldSite() {
    await createSiteDir()
    return copyStaticAssets()
  }
}
