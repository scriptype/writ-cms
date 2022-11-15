const fs = require('fs')

const readFileContent = (path) => {
  return fs.readFileSync(path, { encoding: 'utf-8' })
}

const isDirectory = path => {
  try { return fs.lstatSync(path).isDirectory() }
  catch (ENOENT) { return false }
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

module.exports = {
  readFileContent,
  isDirectory,
  getSlug
}
