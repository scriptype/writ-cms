const { atomicReplace, atomicFS } = require('./lib/fileSystemHelpers')
const Settings = require('./settings')
const Debug = require('./debug')

const create = async () => {
  Debug.timeStart('site directory')
  const { exportDirectory, out } = Settings.getSettings()
  Debug.debugLog('create site directory', exportDirectory, out)
  if (!exportDirectory || exportDirectory === '.' || exportDirectory === './' || exportDirectory === '..' || exportDirectory === '../' || exportDirectory === '/' || exportDirectory === '~') {
    throw new Error(`Dangerous export directory: "${exportDirectory}". Won't continue.`)
  }
  try {
    await atomicFS.rm(out, { recursive: true })
  }
  catch (ENOENT) {}
  finally {
    return atomicFS.mkdir(out).then(() => {
      Debug.timeEnd('site directory')
    })
  }
}

module.exports = {
  create
}
