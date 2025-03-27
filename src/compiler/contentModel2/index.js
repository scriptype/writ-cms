const { isTemplateFile } = require('./helpers')
const models = {
  homepage: require('./models/homepage'),
  subpage: require('./models/subpage'),
  collection: require('./models/collection'),
  asset: require('./models/asset')
}

const isHomepageFile = (node) => {
  return isTemplateFile(node) && node.name.match(/^(homepage|home|index)\..+$/)
}

const isHomepageDirectory = (node) => {
  return node.name.match(/^(homepage|home)$/)
}

const isPagesDirectory = (node) => {
  return node.name.match(/^(subpages|pages)$/)
}

const isAssetsDirectory = (node) => {
  return node.name.match(/^assets$/)
}

const root = (fsTree) => {
  const contentModel = {
    homepage: null,
    subpages: [],
    collections: [],
    assets: []
  }

  fsTree.forEach(node => {
    if (isHomepageFile(node)) {
      contentModel.homepage = models.homepage(node)
      return
    }

    if (!node.children) {
      contentModel.assets.push(
        models.asset(node)
      )
      return
    }

    if (isHomepageDirectory(node)) {
      contentModel.homepage = models.homepage(node)
      return
    }

    if (isPagesDirectory(node)) {
      node.children.forEach(childNode => {
        if (isTemplateFile(childNode) || childNode.children?.find(isTemplateFile)) {
          contentModel.subpages.push(
            models.subpage(childNode)
          )
        }
      })
      return
    }

    if (isAssetsDirectory(node)) {
      node.children.forEach(childNode => {
        contentModel.assets.push(models.asset(childNode))
      })
      return
    }

    contentModel.collections.push(
      models.collection(node)
    )
  })

  return contentModel
}

module.exports = {
  create: root
}
