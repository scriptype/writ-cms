const _ = require('lodash')
const { dirname, extname } = require('path')
const { paths } = require('./settings')
const { templateParser } = require('./rendering')
const { getSlug } = require('./helpers')
const { UNCATEGORIZED } = require('./constants')

const hasContent = (fsObject) => {
  return typeof fsObject.content !== 'undefined'
}

const isPostFile = (fsObject) => {
  return templateParser.isTemplate(fsObject.name) && hasContent(fsObject)
}

const isFolderedPostIndexFile = (fsObject) => {
  return isPostFile(fsObject) && fsObject.name.match(/^(index|post)\..+$/)
}

const removeExtension = (fileName) => {
  return fileName.replace(extname(fileName), '')
}

const createAssets = (fsObject) => {
  return {
    assets: fsObject.children
  }
}

const createLocalAsset = (fsObject) => {
  return {
    localAsset: fsObject
  }
}

const createSubPage = (fsObject) => {
  const title = removeExtension(fsObject.name)
  return {
    subPage: {
      ...fsObject,
      data: {
        title,
        slug: getSlug(title),
        ...templateParser.parseTemplate(fsObject.content)
      }
    }
  }
}

const createSubPages = (fsObject) => {
  return {
    subPages: fsObject.children.map(createSubPage).map(({ subPage }) => subPage)
  }
}

const createCategory = (fsObject) => {
  return {
    category: {
      name: fsObject.name,
      posts: fsObject.children.map(({ post }) => post).filter(Boolean),
      localAssets: fsObject.children.map(({ localAsset}) => localAsset).filter(Boolean)
    }
  }
}

const createFolderedPost = (fsObject) => {
  const title = removeExtension(fsObject.name)
  const indexFile = fsObject.children
    .map(({ folderedPostIndex }) => folderedPostIndex)
    .find(Boolean)
  const localAssets = fsObject.children
    .map(({ localAsset }) => localAsset)
    .filter(Boolean)
  return {
    post: {
      ..._.omit(fsObject, 'children'),
      postMode: 'foldered',
      localAssets,
      data: {
        title,
        slug: getSlug(title),
        id: getSlug(title),
        category: dirname(fsObject.name),
        ...templateParser.parseTemplate(indexFile.content)
      }
    }
  }
}

const createFolderedPostIndex = (fsObject) => {
  return {
    folderedPostIndex: fsObject
  }
}

const createUncategorizedPost = (fsObject) => {
  const title = removeExtension(fsObject.name)
  return {
    post: {
      ...fsObject,
      postMode: 'uncategorized',
      data: {
        title,
        slug: getSlug(title),
        id: getSlug(title),
        category: UNCATEGORIZED,
        ...templateParser.parseTemplate(fsObject.content)
      }
    }
  }
}

const createPost = (fsObject) => {
  const title = removeExtension(fsObject.name)
  return {
    post: {
      ...fsObject,
      postMode: 'file',
      data: {
        title,
        slug: getSlug(title),
        id: getSlug(title),
        category: dirname(fsObject.path),
        ...templateParser.parseTemplate(fsObject.content)
      }
    }
  }
}

const createUnrecognizedDirectory = (fsObject) => {
  return {
    unrecognizedDirectory: fsObject
  }
}

const createUnrecognizedFile = (fsObject) => {
  return {
    unrecognizedFile: fsObject
  }
}

const parseIndex = (tree) => {
  return tree.map(fsObject => {
    const isTemplate = templateParser.isTemplate(fsObject.name)
    const isDirectory = fsObject.children
    const isRootLevel = fsObject.depth === 0
    const isCategoryLevel = fsObject.depth === 1
    const isSubFolderLevel = fsObject.depth === 2

    if (!isDirectory && !isTemplate) {
      return createLocalAsset(fsObject)
    }

    if (isRootLevel) {
      if (isPostFile(fsObject)) {
        return createUncategorizedPost(fsObject)
      }
      if (fsObject.name === paths.SUBPAGES) {
        return createSubPages(fsObject)
      }
      if (fsObject.name === paths.assets) {
        return createAssets(fsObject)
      }
      return createCategory({
        ...fsObject,
        children: parseIndex(fsObject.children)
      })
    }

    if (isCategoryLevel) {
      if (isPostFile(fsObject)) {
        return createPost(fsObject)
      }
      if (fsObject.children.some(isFolderedPostIndexFile)) {
        return createFolderedPost({
          ...fsObject,
          children: parseIndex(fsObject.children)
        })
      }
    }

    if (isSubFolderLevel) {
      if (isFolderedPostIndexFile(fsObject)) {
        return createFolderedPostIndex(fsObject)
      }
    }

    if (isDirectory) {
      return createUnrecognizedDirectory({
        ...fsObject,
        children: parseIndex(fsObject.children)
      })
    }
    return createUnrecognizedFile(fsObject)
  })
}

const createContentModel = (parsedIndex) => {
  return parsedIndex.reduce((contentTree, content) => {
    if (content.category) {
      return {
        ...contentTree,
        categories: contentTree.categories.concat({
          ...content.category,
          posts: content.category.posts.map(({ data }) => data.id)
        }),
        posts: contentTree.posts.concat(content.category.posts)
      }
    } if (content.post) {
      const uncategorizedCategory = contentTree.categories.find(
        cat => cat.name === UNCATEGORIZED
      )
      if (uncategorizedCategory) {
        uncategorizedCategory.posts.push(content.post.data.id)
      } else {
        contentTree.categories.push({
          name: UNCATEGORIZED,
          posts: [content.post.data.id],
          localAssets: []
        })
      }
      return {
        ...contentTree,
        posts: contentTree.posts.concat(content.post),
      }
    } if (content.subPages) {
      return {
        ...contentTree,
        subPages: content.subPages
      }
    }
    return {
      ...contentTree,
      unrecognized: contentTree.unrecognized.concat(content)
    }
  }, {
    categories: [],
    posts: [],
    subPages: [],
    unrecognized: []
  })
}

module.exports = {
  parseIndex,
  createContentModel
}
