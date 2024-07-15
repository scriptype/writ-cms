const { join } = require('path')
const fs = require('fs/promises')
const { extname } = require('path')
const slug = require('slug')

const contentRoot = async (rootDirectory, contentDirectory) => {
  if (!rootDirectory) {
    throw new Error('rootDirectory is a required parameter')
  }
  try {
    await fs.stat(join(rootDirectory, contentDirectory))
    return join(rootDirectory, contentDirectory)
  } catch (ENOENT) {
    return rootDirectory
  }
}

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

const ensureDirectory = async (path) => {
  try {
    return await fs.mkdir(path, { recursive: true })
  } catch (e) { } finally {
    return Promise.resolve(true)
  }
}

const getSlug = (string) => slug(removeExtension(string), '-')

const makePermalink = ({ prefix, parts, addHTMLExtension }) => {
  const permalink = [
    prefix === '/' ? '' : prefix,
    ...parts.filter(Boolean).map(getSlug)
  ].join('/')
  return addHTMLExtension ? permalink + '.html' : permalink
}

const maybeRawHTMLType = (extension) => {
  if (!extension || !extension.match(/^\.(html|hbs|handlebars)$/i)) {
    return null
  }
  return 'raw-html-type'
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
  contentRoot,
  readFileContent,
  loadJSON,
  isDirectory,
  ensureDirectory,
  getSlug,
  makePermalink,
  maybeRawHTMLType,
  removeExtension,
  replaceExtension,
  pipe,
  rightPad,
  curry,
  last
}
