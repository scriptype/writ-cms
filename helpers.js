const fs = require('fs/promises')
const { extname } = require('path')

const readFileContent = path => {
  return fs.readFile(path, { encoding: 'utf-8' })
}

const isDirectory = async (path) => {
  try {
    return (await fs.lstat(path)).isDirectory()
  }
  catch (ENOENT) {
    return false
  }
}

const forbiddenChars = 'äÄåÅÉéi̇ıİİöÖüÜçÇğĞşŞ'
const slugChars = 'aaaaeeiiiioouuccggss'

const getSlug = (string) => {
  string = string.trim()
  string = string.replace(/\s+/g, '-')
  for (let i = 0; i < forbiddenChars.length - 1; i++) {
    const regex = new RegExp(forbiddenChars[i], 'gi')
    string = string.replace(regex, slugChars[i])
  }
  return string.toLowerCase()
}

const removeExtension = (fileName) => {
  return fileName.replace(extname(fileName), '')
}

module.exports = {
  readFileContent,
  isDirectory,
  getSlug,
  removeExtension
}
