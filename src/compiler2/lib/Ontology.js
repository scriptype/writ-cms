const ContentModel = require('../contentModel')

/*
const createContentModel = async (fsTree, initialModel) => {
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
  }, initialModel || {
    assets: [],
    subpages: [],
    homepage: createHomepage({}).data,
    localAssets: []
  })
}
*/

class Ontology {
  constructor(name, contentTree) {
    this.name = name
    this.contentTree = contentTree
    this.contentModel = null
  }

  async map() {
    console.log(ContentModel.create, this.contentTree, this.schema)
  }

  async model() {
    this.contentModel = this.contentModel || await this.map()
    return this.contentModel
  }
}

module.exports = Ontology
