const { stat, readdir } = require('fs/promises')
const { join, resolve, relative, extname, sep } = require('path')
const { readFileContent, contentRoot, isDirectory } = require('../../../helpers')
const { debugLog } = require('../../../debug')

const {
  shouldIncludePath,
  isTextFile,
  lookBack
} = require('./utils')

const exploreDirectory = async (currentPath, depth = 0) => {
  debugLog('exploring', currentPath)
  return Promise.all(
    (await readdir(currentPath))
      .filter(shouldIncludePath)
      .map(async fileName => {
        const accumulatedPath = join(currentPath, fileName)
        const rootPath = lookBack(accumulatedPath, depth + 1)
        const { birthtime } = await stat(accumulatedPath)
        const baseProperties = {
          name: fileName,
          path: relative(rootPath, accumulatedPath),
          stats: {
            /* Because JSON driver can't easily parse date from string
             * let contentTree not know about dates for now */
            birthtime: birthtime.toString()
          },
          depth,
        }
        if (await isDirectory(accumulatedPath)) {
          return {
            ...baseProperties,
            children: await exploreDirectory(accumulatedPath, depth + 1)
          }
        }
        const extension = extname(fileName)
        const fileProperties = {
          ...baseProperties,
          name: fileName.replace(new RegExp(extension + '$'), ''),
          extension,
        }
        if (isTextFile(extension)) {
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

/* * *
 * * *
 * * */

/*
const ContentParsers = require('../../lib/Parsers')

class FileSystemEntry extends ContentTreeEntry {
  constructor({ name, path, children, stats, content }) {
    super({
      name,
      pathway: path.split(sep),
      timestamp: stats.birthtime,
      children,
      content
    })
  }
}

class FileEntry extends FileSystemEntry {
  constructor(entry) {
    super(entry)
    const extension = entry.extension?.replace(/^\./, '')?.toLowerCase()
    const { attributes, parsedContent } = this.parseContent(entry.content, extension)
    for (const key in attributes) {
      if (!attributes.hasOwnProperty(key)) {
        continue
      }
      this[key] = attributes[key]
    }
    this.HTMLContent = parsedContent
  }

  parseContent(content, extension) {
    const parsers = {
      'txt': ContentParsers.markdown,
      'md': ContentParsers.markdown,
      'markdown': ContentParsers.markdown,
      'hbs': ContentParsers.html,
      'html': ContentParsers.html,
      'unrecognized': _=>_
    }

    const parse = parsers[extension] || parsers.unrecognized
    return parse(content)
  }
}

class FolderEntry extends FileSystemEntry {
  constructor(entry) {
    super(entry)
    this.setChildren(entry.children)
  }
}
*/

const frontMatter = require('front-matter')
const _ = require('lodash')
const Driver = require('../../lib/Driver')
const { ContentTree, ContentTreeEntry } = require('../../lib/ContentTree')

class FileSystemDriver extends Driver {
  constructor() {
    super()
  }

  async parse(fullPath) {
    const fileSystemTree = await exploreDirectory(fullPath)
    const abstractContentTree = this.tokenize(fileSystemTree)
    return {
      fileSystemTree,
      contentTree: new ContentTree(abstractContentTree)
    }
  }

  // this works, now find what to do next with this super abstract content tree
  deepTokenize(obj) {
    if (Number.isInteger(obj)) {
      return {
        type: 'number',
        data: obj
      }
    }

    if (typeof obj === 'string') {
      return {
        type: 'string',
        data: obj
      }
    }

    if (typeof obj === 'boolean') {
      return {
        type: 'boolean',
        data: obj
      }
    }

    /* Because JSON driver can't easily parse date from string
     * let contentTree not know about dates for now
    if (obj instanceof Date) {
      return {
        type: 'date',
        data: obj
      }
    }
    */

    if (Array.isArray(obj)) {
      return {
        type: 'array',
        data: obj.map(o => this.deepTokenize(o)),
      }
    }

    return {
      type: 'object',
      data: Object.keys(obj).reduce((result, key) => {
        // omit children from data
        if (key === 'children') {
          return result
        }
        // tokenize all other keys
        return {
          ...result,
          [key]: this.deepTokenize(obj[key])
        }
      }, {}),
      subTree: (obj.children || []).map(c => this.deepTokenize(c))
    }
  }

  mapExtensionToFormat(extension) {
    if (!extension) {
      return 'unformatted'
    }
    return {
      '.txt': 'plaintext',
      '.text': 'plaintext',
      '.md': 'markdown',
      '.markdown': 'markdown',
      '.html': 'hypertext',
      '.htm': 'hypertext',
      '.hbs': 'handlebars',
      '.handlebars': 'handlebars',
      '.json': 'json',
      '.yml': 'yml',
    }[extension] || 'unknown'
  }

  tokenize(fileSystemTree) {
    return fileSystemTree.reduce((entries, entry) => {
      if (entry.content) {
        const frontMatterResult = frontMatter(entry.content || '')
        return entries.concat(
          this.deepTokenize({
            ...entry,
            ...(frontMatterResult.attributes || {}),
            content: frontMatterResult.body,
            format: this.mapExtensionToFormat(entry.extension),
          })
        )
      }

      return entries.concat(
        this.deepTokenize({
          ...entry,
          format: this.mapExtensionToFormat(entry.extension)
        })
      )
    }, [])
  }
}

module.exports = FileSystemDriver
