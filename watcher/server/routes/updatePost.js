const fs = require('fs/promises')
const { extname } = require('path')
const frontMatter = require('front-matter')
const TurndownService = require('turndown')

const turndownService = new TurndownService()

module.exports = ({ settings }) => async (req, res, next) => {
  const { content, path: srcFilePath } = req.body
  const extension = extname(srcFilePath)
  const isMarkdown = /\.(md|markdown)$/i.test(extension)

  if (isMarkdown) {
    const md = turndownService.turndown(content)
    const fileContent = await fs.readFile(srcFilePath, 'utf-8')
    const front = frontMatter(fileContent)
    const newFileContent = [
      '---',
      front.frontmatter.trim(),
      '---',
      md.trim()
    ].join('\n')
    await fs.writeFile(srcFilePath, newFileContent)
  } else {
    console.log('not handling', extension)
  }

  res.end()
}
