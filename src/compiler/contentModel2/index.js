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

const isSubpageIndexFile = (node) => {
  return isTemplateFile(node) && node.name.match(/^(page|index)\..+$/)
}

const isCollectionIndexFile = (node) => {
  return isTemplateFile(node) && node.name.match(/^collection\..+$/)
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

const defaultHomepage = () => models.homepage({
  name: 'index',
  extension: 'md',
  content: ''
})

const root = (fsTree) => {
  const contentModel = {
    homepage: defaultHomepage(),
    subpages: [],
    collections: [],
    assets: []
  }

  fsTree.forEach(node => {
    if (isHomepageFile(node)) {
      contentModel.homepage = models.homepage(node)
      return
    }

    if (isTemplateFile(node)) {
      contentModel.subpages.push(
        models.subpage(node)
      )
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
        if (isTemplateFile(childNode) || childNode.children?.find(isSubpageIndexFile)) {
          contentModel.subpages.push(
            models.subpage(childNode)
          )
        } else {
          contentModel.assets.push(
            models.asset(node)
          )
        }
      })
      return
    }

    if (isAssetsDirectory(node)) {
      node.children.forEach(childNode => {
        contentModel.assets.push(
          models.asset(childNode)
        )
      })
      return
    }

    if (node.children.find(isSubpageIndexFile)) {
      contentModel.subpages.push(
        models.subpage(node)
      )
      return
    }

    if (node.children.find(isCollectionIndexFile)) {
      contentModel.collections.push(
        models.collection(node)
      )
      return
    }

    contentModel.assets.push(
      models.asset(node)
    )
  })

  return contentModel
}

module.exports = {
  create: root
}
