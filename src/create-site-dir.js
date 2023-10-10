const { rm, mkdir } = require('fs/promises')
const { exportDirectory, out } = require('./settings').getSettings()
const Debug = require('./debug')

const createSiteDir = async () => {
  Debug.debugLog('create site directory', exportDirectory, out)
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

module.exports = {
  createSiteDir
}
