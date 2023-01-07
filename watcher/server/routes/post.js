const fs = require('fs/promises')
const { extname, join, dirname } = require('path')
const _ = require('lodash')
const frontMatter = require('front-matter')
const TurndownService = require('turndown')
const { getSlug } = require('../../../helpers')

const turndownService = new TurndownService()

const toFrontMatter = (obj) => {
  return `---
${Object.keys(obj).map(key => `${key}: ${ Array.isArray(obj[key]) ? obj[key].map(k => `
- ${k}`).join('') : obj[key] }
`).join('')}---
  `
}

const getPostRenamePaths = (src, newTitle, extension, foldered) => {
  let srcPath = src
  let destPath = newTitle + extension
  if (foldered) {
    srcPath = dirname(src)
    destPath = join(dirname(srcPath), newTitle)
  } else {
    if (srcPath.match(/\//)) {
      destPath = join(dirname(srcPath), newTitle + extension)
    }
  }
  return [
    srcPath,
    destPath
  ]
}

const savePost = async (path, { content, metadata }) => {
  const fileContent = await fs.readFile(path, 'utf-8')
  const front = frontMatter(fileContent)
  const newFileContent = [
    metadata || '---\n' + front.frontmatter.trim() + '\n---',
    content || front.body
  ].join('\n')
  await fs.writeFile(path, newFileContent)
}

const renamePost = async (srcFilePath, newTitle, updateUrl, foldered, extension) => {
  const fileContent = await fs.readFile(srcFilePath, 'utf-8')
  const { attributes } = frontMatter(fileContent)
  if (updateUrl) {
    await savePost(srcFilePath, {
      metadata: toFrontMatter(_.omit(attributes, 'title'))
    })
    const [srcPath, destPath] = getPostRenamePaths(srcFilePath, newTitle, extension, foldered)
    await fs.rename(srcPath, destPath)
  } else {
    await savePost(srcFilePath, {
      metadata: toFrontMatter({
        ...attributes,
        title: newTitle
      })
    })
  }
}

module.exports = ({ settings }) => async (req, res, next) => {
  const { content, title, updateUrl, path, foldered } = req.body
  const extension = extname(path)
  const srcFilePath = join(settings.rootDirectory || '.', path)

  console.log('req.body', req.body)

  if (typeof content !== 'undefined') {
    let newSrcContent = content.trim()
    if (/\.(md|markdown|txt)$/i.test(extension)) {
      newSrcContent = turndownService.turndown(content).trim()
    }
    await savePost(srcFilePath, newSrcContent)
  }
  if (typeof title !== 'undefined') {
    await renamePost(srcFilePath, title, updateUrl, foldered, extension)
  }

  res.end()
}
