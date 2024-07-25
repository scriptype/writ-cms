const _ = require('lodash')
const Settings = require('../../../../settings')
const Dictionary = require('../../../../dictionary')
const { last } = require('../../../../helpers')
const { createBlog } = require('../blog')
const { createLocalAsset } = require('./models/localAsset')
const { createAssets } = require('./models/asset')

const {
  createHomepage,
  createFolderedHomepage,
  createFolderedHomepageIndex
} = require('./models/homepage')

const {
  createSubpage,
  createFolderedSubpage,
  createFolderedSubpageIndex
} = require('./models/subpage')

const templateExtensions = [
  '.hbs',
  '.handlebars',
  '.md',
  '.markdown',
  '.txt',
  '.text',
  '.html'
]

const isTemplateFile = (fsObject) => {
  console.log('isTemplateFile', fsObject)
  return new RegExp(templateExtensions.join('|'), 'i').test(fsObject.extension)
}

const isFolderedSubpageIndexFile = (fsObject) => {
  console.log('isFolderedSubpageIndexFile -> isTemplateFile with', fsObject)
  return isTemplateFile(fsObject) && fsObject.name.match(/^page\..+$/)
}

const isHomepageFile = (fsObject) => {
  console.log('isHomepageFile -> isTemplateFile with', fsObject)
  return isTemplateFile(fsObject) && fsObject.name.match(/^(homepage|home|index)\..+$/)
}

const isHomepageDirectory = (fsObject) => {
  const { homepageDirectory } = Settings.getSettings()
  const pattern = new RegExp(`^(${homepageDirectory}|homepage|home)$`)
  return fsObject.name.match(pattern)
}

const isAssetsDirectory = (fsObject) => {
  if (!fsObject.children) {
    return false
  }
  const { assetsDirectory } = Settings.getSettings()
  const pattern = new RegExp(`^${assetsDirectory}$`, 'i')
  return fsObject.name.match(pattern)
}

const isBlogFolder = (fsObject) => {
  const isFolder = !!fsObject.children
  const isNamedBlog = fsObject.name.match(/blog/i)
  const hasBlogIndex = fsObject.children.find(f => {
    console.log('hasBlogIndex -> isTemplateFile with', f)
    return isTemplateFile(f) && f.name.match(/^blog\./i)
  })
  return isFolder && (isNamedBlog || hasBlogIndex)
}

const newEntry = ({
  contentModel,
  key,
  entryFn,
  entry,
  liftEntries,
  replace
}) => {
  const _entry = entry || entryFn()
  const newContentModel = {
    ...contentModel,
    [key]: replace ? _entry : [
      ...contentModel[key],
      _entry
    ]
  }
  if (typeof liftEntries !== 'function') {
    return newContentModel
  }
  const { key: liftedEntriesKey, entries } = liftEntries(_entry)
  return {
    ...newContentModel,
    [liftedEntriesKey]: [
      ...newContentModel[liftedEntriesKey],
      ...entries
    ]
  }
}

const upsertEntry = ({
  contentModel,
  key,
  entryFn,
  upsert
}) => {
  const collection = contentModel[key]
  const foundEntry = collection.find(entryFn)
  const newCollection = foundEntry ?
    collection.map(entry => entry === foundEntry ? upsert(foundEntry) : entry) :
    collection.concat(upsert())
  return {
    ...contentModel,
    [key]: newCollection
  }
}

const withAssets = (contentModel, fsObject) => {
  return newEntry({
    contentModel,
    key: 'assets',
    entryFn: () => createAssets(fsObject).data,
    replace: true
  })
}

const withLocalAsset = (contentModel, fsObject) => {
  return newEntry({
    contentModel,
    key: 'localAssets',
    entryFn: () => createLocalAsset(fsObject)
  })
}

const withHomepage = (contentModel, fsObject) => {
  return newEntry({
    contentModel,
    key: 'homepage',
    entryFn: () => createHomepage(fsObject).data,
    replace: true
  })
}

const withFolderedHomepage = (contentModel, fsObject) => {
  return newEntry({
    contentModel,
    key: 'homepage',
    entryFn: () => {
      const homepage = createFolderedHomepage({
        ...fsObject,
        children: fsObject.children.map(mapFolderedHomepageTree)
      })
      return homepage.data
    },
    replace: true
  })
}

const mapFolderedHomepageTree = (fsObject) => {
  if (isHomepageFile(fsObject)) {
    return createFolderedHomepageIndex(fsObject)
  }
  return createLocalAsset({
    ...fsObject,
    isFolder: !!fsObject.children
  })
}

const withFolderedSubpage = (contentModel, fsObject) => {
  return newEntry({
    contentModel,
    key: 'subpages',
    entryFn: () => createFolderedSubpage({
      ...fsObject,
      children: fsObject.children.map(f => {
        console.log('withFolderedSubpage -> mapFolderedSubpageTree', f)
        return mapFolderedSubpageTree(f)
      })
    }).data
  })
}

const mapFolderedSubpageTree = (fsObject) => {
  console.log('mapFolderedSubpageTree -> isFolderedSubpageIndexFile', fsObject)
  if (isFolderedSubpageIndexFile(fsObject)) {
    return createFolderedSubpageIndex(fsObject)
  }
  return createLocalAsset({
    ...fsObject,
    isFolder: !!fsObject.children
  })
}

const withSubpage = (contentModel, fsObject) => {
  return newEntry({
    contentModel,
    key: 'subpages',
    entryFn: () => createSubpage(fsObject).data
  })
}

const withBlog = (contentModel, fsObject) => {
  console.log('root.withBlog fsTree:', fsObject)
  return newEntry({
    contentModel,
    key: 'blog',
    entryFn: () => createBlog(fsObject, { foldered: true }),
    replace: true
  })
}

/*
 * TODO: Implement [any content model] as rootContentModel
 * TODO: Think about subpages as default rootContentModel. pagesFolder would be a portal
 * */
const createContentModel = (fsTree) => {
  const { assetsDirectory } = Settings.getSettings()
  return fsTree.reduce((contentModel, fsObject) => {
    if (fsObject.children) {
      if (isHomepageDirectory(fsObject)) {
        console.log('foldered homepage', fsObject)
        return withFolderedHomepage(contentModel, fsObject)
      }
      if (isAssetsDirectory(fsObject)) {
        console.log('assets directory', fsObject)
        return withAssets(contentModel, fsObject)
      }
      if (isBlogFolder(fsObject)) {
        console.log('blog folder', fsObject)
        //return withBlog(contentModel, fsObject)
        return contentModel
      }
      if (fsObject.children.some(f => {
        console.log('createModel -> isFolderedSubpageIndexFile', f)
        return isFolderedSubpageIndexFile(f)
      })) {
        console.log('foldered subpage', fsObject)
        return withFolderedSubpage(contentModel, {
          ...fsObject,
          children: fsObject.children.map(f => {
            console.log('createModel -> mapFolderedSubpageTree', f)
            return mapFolderedSubpageTree(f)
          })
        })
      }
      console.log('localAsset folder', fsObject)
      return withLocalAsset(contentModel, {
        ...fsObject,
        isFolder: true
      })
    }
    if (isHomepageFile(fsObject)) {
      console.log('homepage', fsObject)
      return withHomepage(contentModel, fsObject)
    }
    console.log('createModel -> isTemplateFile with', fsObject)
    if (isTemplateFile(fsObject)) {
      console.log('subpage', fsObject)
      return withSubpage(contentModel, fsObject)
    }
    console.log('localAsset', fsObject)
    return withLocalAsset(contentModel, {
      ...fsObject,
      isFolder: false
    })
  }, {
    assets: [],
    subpages: [],
    homepage: createHomepage({}).data,
    localAssets: []
  })
}

module.exports = createContentModel
