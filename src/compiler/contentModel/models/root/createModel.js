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
  return new RegExp(templateExtensions.join('|'), 'i').test(fsObject.extension)
}

const isFolderedSubpageIndexFile = (fsObject) => {
  return isTemplateFile(fsObject) && fsObject.name.match(/^page\..+$/)
}

const isHomepageFile = (fsObject) => {
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
    return isTemplateFile(f) && f.name.match(/^blog\./i)
  })
  return isFolder && (isNamedBlog || hasBlogIndex)
}

const newEntry = async ({
  contentModel,
  key,
  entryFn,
  entry,
  liftEntries,
  replace
}) => {
  const _entry = entry || await entryFn()
  const newContentModel = {
    ...contentModel,
    [key]: replace ? _entry : [
      ...(contentModel[key] || []),
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
      children: fsObject.children.map(mapFolderedSubpageTree)
    }).data
  })
}

const mapFolderedSubpageTree = (fsObject) => {
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
  return newEntry({
    contentModel,
    key: 'blog',
    entryFn: async () => await createBlog(fsObject, { foldered: true }),
    replace: true
  })
}

/*
 * TODO: Implement [any content model] as rootContentModel
 * TODO: Think about subpages as default rootContentModel. pagesFolder would be a portal
 * */
const createContentModel = async (fsTree) => {
  const { assetsDirectory } = Settings.getSettings()
  return fsTree.reduce(async (contentModel, fsObject) => {
    if (fsObject.children) {
      if (isHomepageDirectory(fsObject)) {
        return withFolderedHomepage(await contentModel, fsObject)
      }
      if (isAssetsDirectory(fsObject)) {
        return withAssets(await contentModel, fsObject)
      }
      if (isBlogFolder(fsObject)) {
        return await withBlog(await contentModel, fsObject)
      }
      if (fsObject.children.some(f => {
        return isFolderedSubpageIndexFile(f)
      })) {
        return withFolderedSubpage(await contentModel, {
          ...fsObject,
          children: fsObject.children.map(f => {
            return mapFolderedSubpageTree(f)
          })
        })
      }
      return withLocalAsset(await contentModel, {
        ...fsObject,
        isFolder: true
      })
    }
    if (isHomepageFile(fsObject)) {
      return withHomepage(await contentModel, fsObject)
    }
    if (isTemplateFile(fsObject)) {
      return withSubpage(await contentModel, fsObject)
    }
    return withLocalAsset(await contentModel, {
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
