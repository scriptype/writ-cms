const { format, basename, extname } = require('path')

const INDEX_TEMPLATE_FILE_NAME = format({ name: 'index', ext: '.hbs'})
const SUBFOLDER_POST_FILE_NAME = format({ name: 'post', ext: '.hbs'})

const isSubfolderPost = (path) => {
  return new RegExp(`^${SUBFOLDER_POST_FILE_NAME}|${INDEX_TEMPLATE_FILE_NAME}$`).test(basename(path))
}

const getOutputPath = (path) => {
  let newPath = path
  if (isSubfolderPost(path)) {
    newPath = path.replace(new RegExp(basename(path)), 'index.html')
  }
  return newPath.replace(new RegExp(extname(path) + '\$'), '.html')
}

const getSubPageOutputPath = (path) => {
  return path
    .replace(new RegExp(extname(path) + '\$'), '.html')
    .replace(/^pages\//, '')
}

module.exports = {
  INDEX_TEMPLATE_FILE_NAME,
  SUBFOLDER_POST_FILE_NAME,
  isSubfolderPost,
  getOutputPath,
  getSubPageOutputPath
}
