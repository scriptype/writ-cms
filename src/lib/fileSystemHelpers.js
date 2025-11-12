const fs = require('fs/promises')

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

module.exports = {
  readFileContent,
  loadJSON,
  isDirectory,
  ensureDirectory
}