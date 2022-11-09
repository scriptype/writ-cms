const { join } = require('path')
const fs = require('fs')
const { getSlug } = require('./helpers/string')
const {
  readFileContent,
  isDirectory,
  shouldIncludeDirectory,
  removeExtension
} = require('./helpers/fs')
const {
  isSubfolderPost,
  getOutputPath,
  getSubPageFileName
} = require('./helpers/rendering')
const { UNCATEGORIZED } = require('./constants')
const { templateParser } = require('./rendering')
const settings = require('./settings')

const fetchAssets = (assetsPath) => {
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
  return fs.readdirSync(pagesPath)
    .map(path => join(pagesPath, path))
    .map(path => {
      if (isDirectory(path)) {
        return fetchSubPages(path)
      }
      const name = removeExtension(getSubPageFileName(path))
      const slug = getSlug(name)
      const src = path
      const pageFile = {
        name,
        slug,
        permalink: `/${slug}`,
        src
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
      return {
        name,
        slug,
        permalink,
        src
      }
    })
}

const fetchDirectoriesWithPosts = (parentPath) => {
  const childPaths = fs.readdirSync(parentPath)
  const directoriesToCheck = childPaths.filter(path => {
    return shouldIncludeDirectory(join(parentPath, path))
  })
  return directoriesToCheck
    .map(dir => ({
      name: dir,
      paths: fs.readdirSync(join(parentPath, dir))
    }))
    .filter(({ paths }) => paths.some(isSubfolderPost))
}

const fetchSubFolderPosts = (category) => {
  return fetchDirectoriesWithPosts(category.name)
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
  const content = readFileContent(src)
  return {
    name: removeExtension(folderName || fileName),
    slug,
    permalink: folderName ? permalink : getOutputPath(permalink),
    category,
    src,
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
  const assets = fetchAssets(settings.paths.ASSETS)
  const subPages = fetchSubPages(settings.paths.SUBPAGES)
  const categories = fetchCategories(settings.paths.CATEGORIES, {
    excludePaths: [settings.paths.ASSETS, settings.paths.SUBPAGES]
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
