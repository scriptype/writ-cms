export const getDeepCategory = (contentTree, path) => {
  const _recurse = (container, pathSegments) => {
    const child = container.find(childNode => {
      if (!childNode.path) {
        return false
      }
      const childPathSegments = childNode.path.split('/')
      return childPathSegments[childPathSegments.length - 1] === pathSegments[0]
    })
    if (pathSegments.length === 1) {
      return child
    }
    return _recurse(child.subtree.categories, pathSegments.slice(1))
  }

  return _recurse(
    contentTree.filter(n => n.type === 'collection').map(c => c.data),
    path.split('/')
  )
}

export const flattenSubtree = (contentModel) => {
  const nodes = []
  const subtree = contentModel.subtree || contentModel

  for (const collection of (subtree.collections || [])) {
    nodes.push({
      type: 'collection',
      name: collection.title,
      data: collection,
      children: buildCollectionChildren(collection)
    })
  }

  if (subtree.homepage) {
    nodes.push({
      type: 'home',
      name: subtree.homepage.title || 'Home',
      data: subtree.homepage
    })
  }

  for (const subpage of (subtree.subpages || [])) {
    nodes.push({
      type: 'page',
      name: subpage.title,
      data: subpage
    })
  }

  return nodes
}

const buildCollectionChildren = (collection) => {
  const nodes = []
  const subtree = collection.subtree || collection

  const categories = (subtree.categories || [])
    .filter(category => !category.isDefaultCategory)
  for (const category of categories) {
    nodes.push({
      type: 'category',
      name: category.title,
      data: category,
      children: buildCategoryChildren(category)
    })
  }

  const posts = subtree.levelPosts || subtree.posts || []
  for (const post of posts) {
    nodes.push({
      type: 'entry',
      name: post.title,
      data: post
    })
  }

  return nodes
}

const buildCategoryChildren = (category) => {
  const nodes = []
  const subtree = category.subtree || category

  const subcategories = (subtree.categories || [])
    .filter(subcategory => !subcategory.isDefaultCategory)
  for (const subcategory of subcategories) {
    nodes.push({
      type: 'category',
      name: subcategory.title,
      data: subcategory,
      children: buildCategoryChildren(subcategory)
    })
  }

  const posts = subtree.levelPosts || subtree.posts || []
  for (const post of posts) {
    nodes.push({
      type: 'entry',
      name: post.title,
      data: post
    })
  }

  return nodes
}
