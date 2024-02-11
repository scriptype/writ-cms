const fs = require('fs/promises')
const { extname } = require('path')

const readFileContent = path => {
  return fs.readFile(path, { encoding: 'utf-8' })
}

const loadJSON = async (path) => {
  try {
    const exists = await fs.stat(path)
    return exists ? JSON.parse(await readFileContent(path)) : {}
  } catch {
    return {}
  }
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
const slugChars      = 'aaaaeeiiiioouuccggss'
const forbiddenToEscape = '(){}[]'

const getSlug = (string) => {
  string = string.trim()
  string = string.replace(/\s+/g, '-')
  for (let i = 0; i < forbiddenChars.length - 1; i++) {
    const regex = new RegExp(forbiddenChars[i], 'gi')
    string = string.replace(regex, slugChars[i])
  }
  for (let i = 0; i < forbiddenToEscape.length - 1; i++) {
    const regex = new RegExp(`\\${forbiddenToEscape[i]}`, 'gi')
    string = string.replace(regex, '-')
  }
  string = string
    .replace(/-{2,}/g, '-')
    .replace(/-\./, '.')
    .replace(/-\//g, '/')
    .replace(/\/-/g, '/')
    .replace(/^-/g, '')
    .replace(/-$/g, '')
  return string.toLowerCase()
}

const removeExtension = (fileName) => {
  return fileName.replace(extname(fileName), '')
}

const replaceExtension = (path, newExtension) => {
  const extension = extname(path)
  if (extension) {
    const re = new RegExp(extension + '$', 'i')
    return path.replace(re, newExtension)
  }
  return path
}

const pipe = (initialValue, functions) => {
  return functions.reduce(async (acc, fn) => fn(await acc), initialValue)
}

const rightPad = (str, amount, character = ' ') => {
  return `${str}${character.repeat(amount)}`.slice(0, amount)
}

const curry = (fn) => {
  return (...args) => fn.bind(null, ...args)
}

const last = (array) => array[array.length -1]

module.exports = {
  readFileContent,
  loadJSON,
  isDirectory,
  getSlug,
  removeExtension,
  replaceExtension,
  pipe,
  rightPad,
  curry,
  last
}
