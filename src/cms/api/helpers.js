const { readdir, readFile, lstat } = require('fs/promises')
const { join, resolve } = require('path')

const contentRootPath = async (rootDirectory, contentDirectory) => {
  if (!rootDirectory) {
    throw new Error('rootDirectory is a required parameter')
  }
  let rootPath = [rootDirectory]
  try {
    await readdir(join(rootDirectory, contentDirectory))
    rootPath.push(contentDirectory)
  } catch {}
  return join(...rootPath)
}

const readFileContent = path => {
  return readFile(path, { encoding: 'utf-8' })
}

const isDirectory = async (path) => {
  try {
    return (await lstat(path)).isDirectory()
  }
  catch (ENOENT) {
    return false
  }
}

const lookBack = (path, depth) => {
  return resolve(path, ...Array(depth).fill('..'))
}

module.exports = {
  contentRootPath,
  readFileContent,
  isDirectory,
  lookBack
}
