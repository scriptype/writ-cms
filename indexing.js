const fs = require('fs')
const { join, format, basename, extname } = require('path')
const { readFileContent, isDirectory, getSlug, removeExtension } = require('./helpers')
const { UNCATEGORIZED } = require('./constants')
const { templateParser } = require('./rendering')
const { paths } = require('./settings')

const isSubfolderPost = (path) => {
  const isTemplateFile = templateParser.isTemplate(path)
  const fileNameMatches = /^(index|post)\..+$/.test(basename(path))
  return isTemplateFile && fileNameMatches
}

const shouldIncludeDirectory = (path) => {
  return isDirectory(path) &&
    !path.startsWith('_') &&
    !path.includes('.') &&
    !path.match(paths.IGNORE_REG_EXP)
}

const getOutputPath = (path) => {
  let newPath = path
  if (isSubfolderPost(path)) {
    newPath = path.replace(new RegExp(basename(path)), 'index.html')
  }
  return newPath.replace(new RegExp(extname(path) + '\$'), '.html')
}

const getSubPageFileName = (path) => {
  return path.replace(new RegExp(`^${paths.SUBPAGES}\/`), '')
}

const fetchAssets = (assetsPath) => {
  if (!isDirectory(assetsPath)) {
    return []
  }
  return fs.readdirSync(assetsPath).map(path => {
    const slug = getSlug(path)
    return {
      name: path,
      slug,
      permalink: `/assets/${slug}`,
      src: join(assetsPath, path),
    }
  })
}

const fetchSubPages = (pagesPath, pages = []) => {
  if (!isDirectory(pagesPath)) {
    return []
  }
  return fs.readdirSync(pagesPath)
    .map(path => join(pagesPath, path))
    .map(path => {
      if (isDirectory(path)) {
        return fetchSubPages(path)
      }
      const fileName = getSubPageFileName(path)
      const name = removeExtension(fileName)
      const slug = getSlug(name)
      const src = path
      const out = join(
        paths.SITE,
        fileName.replace(new RegExp(extname(path) + '\$'), '.html')
      )
      const pageFile = {
        name,
        slug,
        permalink: `/${slug}`,
        src,
        out
      }
      if (templateParser.isTemplate(path)) {
        return {
          ...pageFile,
          content: readFileContent(src)
        }
      }
      return pageFile
    })
}

const fetchCategories = (parentPath, { excludePaths }) => {
  return fs.readdirSync(parentPath)
    .filter(shouldIncludeDirectory)
    .filter(dir => !excludePaths.includes(dir))
    .concat(UNCATEGORIZED)
    .map(name => {
      const slug = getSlug(name)
      const permalink = `/${slug}`
      const src = join(parentPath, name)
      const out = join(paths.SITE, name, 'index.html')
      return {
        name,
        slug,
        permalink,
        src,
        out
      }
    })
}

const fetchSubFolderPosts = (category) => {
  const childPaths = fs.readdirSync(category.name)
  const directoriesToCheck = childPaths.filter(path => {
    return shouldIncludeDirectory(join(category.name, path))
  })
  return directoriesToCheck
    .map(dir => ({
      name: dir,
      paths: fs.readdirSync(join(category.name, dir))
    }))
    .filter(({ paths }) => paths.some(isSubfolderPost))
    .map(dir => {
      const fileName = dir.paths.find(isSubfolderPost)
      return createPostFile(fileName, category, dir.name)
    })
}

const fetchFilePosts = (category) => {
  return fs.readdirSync(category.name)
    .filter(templateParser.isTemplate)
    .map(fileName => createPostFile(fileName, category))
}

const fetchUnCategorizedPosts = (categoryOfUncategorizedPosts) => {
  return fs.readdirSync('.')
    .filter(templateParser.isTemplate)
    .map(fileName => createPostFile(fileName, categoryOfUncategorizedPosts))
}

const getPostPermalink = (fileNameSlug, categorySlug, folderSlug) => {
  if (categorySlug === getSlug(UNCATEGORIZED)) {
    return join('/', fileNameSlug)
  }
  if (folderSlug) {
    return join('/', categorySlug, folderSlug)
  }
  return join('/', categorySlug, fileNameSlug)
}

const getPostSrcPath = (fileName, category, folderName) => {
  return [
    category.name === UNCATEGORIZED ?  '' : category.name,
    folderName || '',
    fileName
  ]
}

const createPostFile = (fileName, category, folderName) => {
  const fileNameSlug = getSlug(fileName)
  const categorySlug = getSlug(category.name)
  const folderSlug = getSlug(folderName || '')
  const name = folderName || fileName
  const slug = getSlug(name)
  const permalink = getPostPermalink(fileNameSlug, categorySlug, folderSlug)
  const src = join(...getPostSrcPath(fileName, category, folderName))
  const out = join(paths.SITE, getOutputPath(src))
  const content = readFileContent(src)
  return {
    name: removeExtension(folderName || fileName),
    slug,
    permalink: folderName ? permalink : getOutputPath(permalink),
    category,
    src,
    out,
    content,
  }
}

const fetchPostsOfCategory = (category) => {
  const paths = fs.readdirSync(category.name)
  const posts = []
  posts.push(...fetchSubFolderPosts(category))
  posts.push(...fetchFilePosts(category))
  return posts
}

const indexSite = () => {
  const assets = fetchAssets(paths.ASSETS)
  const subPages = fetchSubPages(paths.SUBPAGES)
  const categories = fetchCategories(paths.CATEGORIES, {
    excludePaths: [paths.ASSETS, paths.SUBPAGES]
  })
  .map(category => ({
    ...category,
    posts: category.name === UNCATEGORIZED ?
      fetchUnCategorizedPosts(category) :
      fetchPostsOfCategory(category)
  }))
  .filter(category => category.posts.length)
  return {
    assets,
    subPages,
    categories,
  }
}

module.exports = {
  indexSite
}
