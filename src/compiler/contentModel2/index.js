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
  return node.children && node.name.match(/^(homepage|home)$/) && node.children.find(isHomepageFile)
}

const isHomepage = (node) => {
  return isHomepageFile(node) || isHomepageDirectory(node)
}

const isPagesDirectory = (node) => {
  return node.children && node.name.match(/^(subpages|pages)$/)
}

const isSubpageIndexFile = (node) => {
  return isTemplateFile(node) && node.name.match(/^(page|index)\..+$/)
}

const isSubpage = (node) => {
  return isTemplateFile(node) || node.children?.find(isSubpageIndexFile)
}

const isCollectionIndexFile = (node) => {
  return isTemplateFile(node) && node.name.match(/^collection\..+$/)
}

const isACollectionDirectory = (node) => {
  return node.children?.find(isCollectionIndexFile)
}

const isAssetsDirectory = (node) => {
  return node.children && node.name.match(/^assets$/)
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
    if (isHomepage(node)) {
      contentModel.homepage = models.homepage(node)
      return
    }

    if (isSubpage(node)) {
      return contentModel.subpages.push(
        models.subpage(node)
      )
    }

    if (isPagesDirectory(node)) {
      return node.children.forEach(childNode => {
        if (isSubpage(childNode)) {
          contentModel.subpages.push(
            models.subpage(childNode)
          )
        } else {
          contentModel.assets.push(
            models.asset(node)
          )
        }
      })
    }

    if (isACollectionDirectory(node)) {
      return contentModel.collections.push(
        models.collection(node)
      )
    }

    if (isAssetsDirectory(node)) {
      return contentModel.assets.push(
        ...node.children.map(models.asset)
      )
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
