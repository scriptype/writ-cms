const fs = require('fs')
const { resolve, basename, extname } = require('path')
const { paths } = require('../settings')

const readFileContent = (path) => {
  return fs.readFileSync(path, { encoding: 'utf-8' })
}

const isDirectory = path => {
  try { return fs.lstatSync(path).isDirectory() }
  catch (ENOENT) { return false }
}

const shouldIncludeDirectory = (path) => {
  return isDirectory(path) &&
    !path.startsWith('_') &&
    !path.includes('.') &&
    !path.match(paths.IGNORE_REG_EXP)
}

const removeExtension = (fileName) => {
  return fileName.replace(extname(fileName), '')
}

module.exports = {
  readFileContent,
  shouldIncludeDirectory,
  isDirectory,
  removeExtension
}
