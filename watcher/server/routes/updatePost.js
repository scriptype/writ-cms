const fs = require('fs/promises')
const { extname, join } = require('path')
const frontMatter = require('front-matter')
const TurndownService = require('turndown')

const turndownService = new TurndownService()

module.exports = ({ settings }) => async (req, res, next) => {
  const { content, path } = req.body
  const extension = extname(path)
  const isMarkdown = /\.(md|markdown)$/i.test(extension)
  const srcFilePath = join(settings.rootDirectory || '.', path)

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
