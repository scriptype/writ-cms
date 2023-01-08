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

const trimTrailingSpace = (content) => {
  return content
    .split('\n')
    .map(line => line.replace(/\s+$/g, ''))
    .join('\n')
}

const preserveNewlines = (content) => {
  const random = parseInt(Math.random() * 100000)
  return content
    .replace(
      /\n<(p|h1|h2|h3|h4|h5|h6)>/g,
      `<<<${random}-\$1->>>`
    )
    .replace(/\n/g, '<br />\n')
    .replace(
      new RegExp(`<<<${random}-(p|h1|h2|h3|h4|h5|h6)->>>`, 'g'),
      '\n<\$1>'
    )
}

module.exports = ({ settings }) => async (req, res, next) => {
  const { content, title, updateUrl, path, foldered } = req.body
  const extension = extname(path)
  const srcFilePath = join(settings.rootDirectory || '.', path)
  const isMarkdown = /\.(md|markdown|txt)$/i.test(extension)

  console.log('req.body', req.body)

  if (typeof content !== 'undefined') {
    const newContent = isMarkdown ?
      turndownService.turndown(preserveNewlines(content)) :
      content
    await savePost(srcFilePath, {
      content: trimTrailingSpace(newContent.trim())
    })
  }
  if (typeof title !== 'undefined') {
    await renamePost(srcFilePath, title, updateUrl, foldered, extension)
  }

  res.end()
}
