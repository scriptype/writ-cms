const { readdir, readFile, writeFile, rm } = require('fs/promises')
const { join, dirname, basename, isAbsolute, relative } = require('path')

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

// TODO: find a nicer way for contentModel to serialize for cms
const omitResolvedLinks = (data) => {
  return JSON.parse(JSON.stringify(data, (key, value) => {
    if (key === '__links' || key === 'links') {
      return undefined
    }
    return value
  }))
}

const replaceFilename = (oldAbsolutePath, newAbsolutePath) => {
  return join(
    dirname(oldAbsolutePath),
    basename(newAbsolutePath)
  )
}

const getRelativePath = async (settings, absolutePath) => {
  const { rootDirectory, contentDirectory } = settings
  const root = await contentRootPath(rootDirectory, contentDirectory)
  return relative(root, absolutePath)
}

const validatePath = async (settings, path) => {
  const relativePath = await getRelativePath(settings, path)
  const isOutsideRoot = (
    relativePath.startsWith('..') ||
    relativePath.startsWith('..\\') ||
    isAbsolute(relativePath)
  )
  const isRootItself = relativePath === ''
  return !isOutsideRoot && !isRootItself
}

const deleteAttachments = (attachments, parentAbsolutePath) => {
  return attachments.map(fileName => {
    const filePath = join(parentAbsolutePath, fileName)
    return rm(filePath)
  })
}

const uploadAttachments = (attachments, parentAbsolutePath) => {
  return attachments.map(file => {
    const dest = join(parentAbsolutePath, file.originalname)
    return writeFile(dest, file.buffer)
  })
}

module.exports = {
  contentRootPath,
  readFileContent,
  omitResolvedLinks,
  replaceFilename,
  getRelativePath,
  validatePath,
  deleteAttachments,
  uploadAttachments
}
