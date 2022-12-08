const { rm, cp, mkdir } = require('fs/promises')
const { resolve, join } = require('path')
const { exec } = require('child_process')
const { getSlug, isDirectory } = require('./helpers')
const { paths, settings } = require('./settings')

const createSiteDir = async () => {
  if (paths.SITE === '.' || paths.SITE === './' || paths.SITE === '..' || paths.SITE === '../' || paths.SITE === '/' || paths.SITE === '~') {
    throw new Error(`Dangerous export directory: "${paths.SITE}". Won't continue.`)
  }
  try {
    await rm(paths.out, { recursive: true })
  }
  catch (ENOENT) {}
  finally {
    return mkdir(paths.out)
  }
}

const copyStaticAssets = async () => {
  const src = join(__dirname, 'rendering', 'assets')
  const out = join(paths.out, paths.ASSETS, 'default')
  if (!(await isDirectory(join(paths.out, paths.ASSETS)))) {
    await mkdir(join(paths.out, paths.ASSETS))
  }
  return cp(src, out, { recursive: true })
}

module.exports = {
  async scaffoldSite() {
    await createSiteDir()
    return copyStaticAssets()
  }
}
