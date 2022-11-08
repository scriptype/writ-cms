const fs = require('fs')
const { resolve, join } = require('path')
const { execSync } = require('child_process')
const { getSlug } = require('./helpers/string')
const { isDirectory } = require('./helpers/fs')
const { paths, settings } = require('./settings')

const createSiteDir = () => {
  if (!paths.SITE) {
    throw new Error('paths.SITE is missing. Won\'t continue.')
  }
  const dirname = resolve(__dirname)
  if (paths.SITE === '.' || paths.SITE === './' || paths.SITE === '..' || paths.SITE === '../' || paths.SITE === '/' || paths.SITE === '~') {
    throw new Error(`Dangerous export directory: "${paths.SITE}". Won't continue.`)
  }
  try {
    execSync(`rm -rf ${paths.SITE}`)
  } catch (e) {
    console.log('createSiteDir error:', e)
  } finally {
    fs.mkdirSync(paths.SITE)
  }
}

const copyPaths = () => {
  fs.readdirSync('.')
    .filter(p => !p.match(paths.IGNORE_REG_EXP))
    .forEach(path => {
      const pathSlug = path.split(' ').join('\\ ')
      execSync(`cp -R ${pathSlug} ${paths.SITE}`)
    })
}

const sluggifyTree = (directory = paths.SITE) => {
  const files = fs.readdirSync(directory)
  files.forEach(fileName => {
    const path = join(directory, fileName)
    const newPath = join(directory, getSlug(fileName))
    if (isDirectory(path)) {
      sluggifyTree(path)
    }
    fs.renameSync(path, newPath)
  })
}

module.exports = {
  scaffoldSite() {
    createSiteDir()
    copyPaths()
  },

  finalizeSite() {
    sluggifyTree()
  }
}
