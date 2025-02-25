const Settings = require('../../settings')
const { createCollection } = require('./collection')
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

const withSubpages = (contentModel, fsObject) => {
  return newEntry({
    contentModel,
    key: 'subpages',
    entryFn: () => {
      const subpages = fsObject.children.map(mapSubpagesTree)
      return subpages.filter(Boolean).map(({ data }) => data)
    },
    replace: true
  })
}

const mapSubpagesTree = (fsObject) => {
  if (isTemplateFile(fsObject)) {
    return createSubpage(fsObject)
  }
  if (fsObject.children && fsObject.children.some(isFolderedSubpageIndexFile)) {
    return createFolderedSubpage({
      ...fsObject,
      children: fsObject.children.map(mapFolderedSubpageTree)
    })
  }
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

const withCollection = (contentModel, fsObject) => {
  return newEntry({
    contentModel,
    key: 'collections',
    entry: createCollection(fsObject)
  })
}

const createContentModel = (fsTree) => {
  const { pagesDirectory, assetsDirectory } = Settings.getSettings()
  return fsTree.reduce((contentModel, fsObject) => {
    if (isHomepageFile(fsObject)) {
      return withHomepage(contentModel, fsObject)
    }
    if (!fsObject.children) {
      return withLocalAsset(contentModel, fsObject)
    }
    if (isHomepageDirectory(fsObject)) {
      return withFolderedHomepage(contentModel, fsObject)
    }
    if (fsObject.name === pagesDirectory) {
      return withSubpages(contentModel, fsObject)
    }
    if (fsObject.name === assetsDirectory) {
      return withAssets(contentModel, fsObject)
    }
    return withCollection(contentModel, fsObject)
  }, {
    assets: [],
    subpages: [],
    collections: [],
    homepage: createHomepage({}).data,
    localAssets: []
  })
}

module.exports = {
  create: createContentModel
}
