const { rimraf } = require('rimraf')
const { mkdir } = require('fs/promises')
const { relative, isAbsolute } = require('path')
const Settings = require('./settings')
const Debug = require('./debug')

const create = async () => {
  Debug.timeStart('site directory')
  const { rootDirectory, exportDirectory, out } = Settings.getSettings()

  const relativePath = relative(rootDirectory, out)
  Debug.debugLog('create site directory', exportDirectory, relativePath, out)

  const isOutsideRoot = (
    relativePath.startsWith('..') ||
    relativePath.startsWith('..\\') ||
    isAbsolute(relativePath)
  )
  const isRootItself = relativePath === ''
  if (isOutsideRoot || isRootItself) {
    throw new Error(`Dangerous export directory: "${exportDirectory}". Won't continue.`)
  }
  try {
    await rimraf(out)
    await mkdir(out)
  }
  finally {
    Debug.timeEnd('site directory')
  }
}

module.exports = {
  create
}
