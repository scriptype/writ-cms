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

/*

class Ontology {
  constructor(contentTree, schema) {
    this.schema = schema
    this.contentTree = contentTree
    this.contentModel = this.map(contentTree, schema)
  }

  async map(contentTree, schema) {
    console.log(contentTree, schema)
    return contentTree.reduce((contentNode, entry) => {
      const models = Array.isArray(schema) ? schema : [schema]
      return models.reduce((contentModel, model) => {
        const newContentModel = model.reduce(contentNode, entry)
        if (contentModel) {
          return contentModel
        }
        return model
      }, {})
    }, {})
  }

  match(entry, _schema) {
    const schema = _schema || this.schema(entry)
    return Object.keys(schema).every((key) => {
      const expected = schema[key]
      const actual = entry[key]
      if (typeof expected === 'string') {
        return (actual.data || actual) === expected
      }
      if (expected instanceof RegExp) {
        return !!(actual.data || actual).match(expected)
      }
      if (expected instanceof Function) {
        return expected(actual.data || actual)
      }
      if (key === 'data') {
        return this.match(actual, expected)
      }
    })
  }

  reduce(model, entry) {
    if (!this.match(entry)) {
      return undefined
    }
    const newModel = {
      ...model,
      homepage: this.contentModel.data
    }
    return newModel
  }

  async render(renderer, model) {
    await this.view(renderer, model)
  }
}

module.exports = Ontology
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
