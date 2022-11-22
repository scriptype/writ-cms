const fs = require('fs')
const { resolve, join } = require('path')
const { execSync } = require('child_process')
const { getSlug, isDirectory } = require('./helpers')
const { paths, settings } = require('./settings')

const createSiteDir = () => {
  const path = paths.SITE || 'site'
  if (paths.SITE === '.' || paths.SITE === './' || paths.SITE === '..' || paths.SITE === '../' || paths.SITE === '/' || paths.SITE === '~') {
    throw new Error(`Dangerous export directory: "${paths.SITE}". Won't continue.`)
  }
  try {
    execSync(`rm -r ${paths.SITE}`)
  } catch (e) {
    console.log('createSiteDir error:', e)
  } finally {
    fs.mkdirSync(paths.SITE)
  }
}

const copyStaticAssets = () => {
  const src = join(__dirname, 'rendering', 'assets')
  const out = join(paths.SITE, paths.ASSETS, '_')
  if (!isDirectory(join(paths.SITE, paths.ASSETS))) {
    fs.mkdirSync(join(paths.SITE, paths.ASSETS))
  }
  execSync(`cp -R ${src} ${out}`)
}

module.exports = {
  scaffoldSite() {
    createSiteDir()
    copyStaticAssets()
  }
}
