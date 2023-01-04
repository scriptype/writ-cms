const fs = require('fs/promises')
const { join, extname } = require('path')
const frontMatter = require('front-matter')
const TurndownService = require('turndown')

const turndownService = new TurndownService()

const acceptedExtensionsForTemplates = [
  '.hbs',
  '.md',
  '.markdown',
  '.txt',
  '.html'
]

const forbiddenChars = 'äÄåÅÉéi̇ıİİöÖüÜçÇğĞşŞ'
const slugChars = 'aaaaeeiiiioouuccggss'

const getSlug = (string) => {
  string = string.trim()
  string = string.replace(/\s+/g, '-')
  for (let i = 0; i < forbiddenChars.length - 1; i++) {
    const regex = new RegExp(forbiddenChars[i], 'gi')
    string = string.replace(regex, slugChars[i])
  }
  return string.toLowerCase()
}

const isDirectory = async (path) => {
  try { return (await fs.lstat(path)).isDirectory() }
  catch (ENOENT) { return false }
}

const isTemplate = (path) => {
  const extension = extname(path)
  if (!extension) {
    return false
  }
  const extensions = acceptedExtensionsForTemplates.join('|')
  const pattern = new RegExp(extensions, 'i')
  return pattern.test(extension)
}

const getPaths = async (directory) => {
  return await Promise.all(
    (await fs.readdir(directory)).map(async path => ({
      path,
      isDirectory: await isDirectory(join(directory, path))
    }))
  )
}

const shouldIncludePath = (path, ignorePaths) => {
  return (
    !path.startsWith('_') &&
    !path.startsWith('.') &&
    !path.match(new RegExp(ignorePaths.join('|')))
  )
}

const getCategories = async (directory, settings) => {
  const paths = await getPaths(directory)
  return paths.filter(({ path, isDirectory }) => {
    return isDirectory && shouldIncludePath(path, settings.ignorePaths)
  }).map(({ path }) => path)
}

const directories = (settings) => {
  return {
    rootDirectory: settings.rootDirectory || '.',
    assetsDirectory: settings.assetsDirectory || 'assets',
    pagesDirectory: settings.pagesDirectory || 'pages'
  }
}

module.exports = ({ settings }) => async (req, res, next) => {
  const {
    rootDirectory,
    assetsDirectory,
    pagesDirectory
  } = directories(settings)

  const categories = await getCategories(rootDirectory, settings)
  const [ categorySlug, postSlug ] = req.url.split('/').filter(Boolean)
  const category = categories.find(cat => getSlug(cat) === categorySlug)

  const posts = await getPaths(join(rootDirectory, category))
  const post = posts.find(({ path }) => getSlug(path) === postSlug)
  const { content } = req.body

  let fullPath
  if (post.isDirectory) {
    const postDirectoryPaths = await getPaths(join(rootDirectory, category, post.path))
    const postFile = postDirectoryPaths.find(({ path, isDirectory }) => {
      return !isDirectory && isTemplate(path) && /^(index|post)/.test(path)
    })

    fullPath = join(rootDirectory, category, post.path, postFile.path)
  } else {
    fullPath = join(rootDirectory, category, post.path)
  }

  const extension = extname(fullPath)
  const isMarkdown = /\.(md|markdown)$/i.test(extension)

  if (isMarkdown) {
    const md = turndownService.turndown(content)
    const fileContent = await fs.readFile(fullPath, 'utf-8')
    const front = frontMatter(fileContent)
    const newFileContent = [
      '---',
      front.frontmatter.trim(),
      '---',
      md.trim()
    ].join('\n')
    await fs.writeFile(fullPath, newFileContent)
  }

  res.end()
}
