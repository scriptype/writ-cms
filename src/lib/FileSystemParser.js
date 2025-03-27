const { stat, readdir } = require('fs/promises')
const { join, relative, resolve, extname } = require('path')
const { readFileContent, isDirectory } = require('./fileSystemHelpers')

module.exports = class FileSystemParser {
  static isTextFile(extension) {
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

  static lookBack(path, depth) {
    return resolve(path, ...Array(depth).fill('..'))
  }

  static async contentRoot(rootDirectory, contentDirectory) {
    if (!rootDirectory) {
      throw new Error('rootDirectory is a required parameter')
    }
    try {
      await stat(join(rootDirectory, contentDirectory))
      return join(rootDirectory, contentDirectory)
    } catch (ENOENT) {
      return rootDirectory
    }
  }

  constructor(fileSystemParserSettings, logger) {
    this.rootDirectory = fileSystemParserSettings.rootDirectory
    this.contentDirectory = fileSystemParserSettings.contentDirectory
    this.ignorePattern = fileSystemParserSettings.IGNORE_PATHS_REG_EXP
    this.logger = logger
  }

  shouldIncludePath(path) {
    return (
      !path.startsWith('_') &&
      !path.startsWith('.') &&
      !path.match(this.ignorePattern)
    )
  }

  async parse() {
    const root = await FileSystemParser.contentRoot(
      this.rootDirectory,
      this.contentDirectory
    )
    this.logger.debug('contentRoot', root)
    return this._parse(root)
  }

  async _parse(path, depth = 0) {
    this.logger.debug('exploring', path)
    return Promise.all(
      (await readdir(path))
      .filter(this.shouldIncludePath.bind(this))
      .map(async fileName => {
        const accumulatedPath = join(path, fileName)
        const rootPath = FileSystemParser.lookBack(accumulatedPath, depth + 1)
        const { birthtime } = await stat(accumulatedPath)
        const baseProperties = {
          name: fileName,
          path: relative(rootPath, accumulatedPath),
          absolutePath: accumulatedPath,
          stats: { birthtime },
          depth,
        }
        if (await isDirectory(accumulatedPath)) {
          return {
            ...baseProperties,
            children: await this._parse(accumulatedPath, depth + 1)
          }
        }
        const extension = extname(fileName)
        const fileProperties = {
          ...baseProperties,
          extension,
        }
        if (FileSystemParser.isTextFile(extension)) {
          const content = await readFileContent(accumulatedPath)
          return {
            ...fileProperties,
            content
          }
        } else {
          return fileProperties
        }
      })
    )
  }
}
