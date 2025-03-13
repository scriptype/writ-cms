const templateExtensions = [
  '.hbs',
  '.handlebars',
  '.md',
  '.markdown',
  '.txt',
  '.text',
  '.html'
]

const isTemplateFile = (node) => {
  return new RegExp(templateExtensions.join('|'), 'i').test(node.extension)
}

const removeExtension = (fileName) => {
  if (fileName.lastIndexOf('.') > 0) {
    return fileName.replace(/(\.[^.]+)?$/, '')
  }
  return fileName
}

const parseTags = (tags = []) => {
  return typeof tags === 'string' ?
    tags.split(',').map(t => t.trim()) :
    tags
}

module.exports = {
  templateExtensions,
  isTemplateFile,
  removeExtension,
  parseTags
}
