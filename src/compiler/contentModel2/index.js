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

const linkEntries = (contentModel) => {
  contentModel.collections.forEach(collection => {
    collection.posts.forEach(post => {
      const fields = Object.keys(post)
      const linkFields = fields
        .map(key => {
          const match = key.match(/(.+){(.+)}/)
          if (!match) {
            return
          }
          const [, entrySlug, categorySlug] = post[key].match(/([^(\s]+)(?:\s*\(([^)]+)\))?/)
          return {
            key: match[1],
            collectionSlug: match[2],
            categorySlug,
            entrySlug
          }
        })
        .filter(Boolean)
      linkFields.forEach(link => {
        const collection = contentModel.collections.find(c => c.slug.match(new RegExp(link.collectionSlug, 'i')))
        const container = link.categorySlug ?
          collection.categories.find(c => c.slug.match(new RegExp(link.categorySlug, 'i'))) || collection :
          collection
        const entry = container.posts.find(p => p.slug.match(new RegExp(link.entrySlug, 'i')))
        post[link.key] = entry
        entry.links = entry.links || {}
        entry.links.relations = entry.links.relations || []
        const relation = entry.links.relations.find(r => r.key === link.key)
        if (relation) {
          relation.entries.push(post)
        } else {
          entry.links.relations.push({
            key: link.key,
            entries: [post]
          })
        }
      })
    })
  })
}

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

  linkEntries(contentModel)
  return contentModel
}

module.exports = {
  create: root
}
