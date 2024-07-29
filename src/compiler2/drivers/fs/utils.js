const { resolve } = require('path')
const Settings = require('../../../settings')

const shouldIncludePath = (path) => {
  const { IGNORE_PATHS_REG_EXP } = Settings.getSettings()
  return (
    !path.startsWith('_') &&
    !path.startsWith('.') &&
    !path.match(IGNORE_PATHS_REG_EXP)
  )
}

const isTextFile = (extension) => {
  const acceptedExtensions = [
    'txt',
    'md',
    'markdown',
    'hbs',
    'handlebars',
    'html',
    'xhtml',
    'htm',
    'rtf',
    'rtfd',
    'json',
    'srt'
  ]
  return new RegExp(`\.(${acceptedExtensions.join('|')})`, 'i').test(extension)
}

const lookBack = (path, depth) => {
  return resolve(path, ...Array(depth).fill('..'))
}

module.exports = {
  shouldIncludePath,
  isTextFile,
  lookBack
}
