const _ = require('lodash')

function findLinkedNode(nodes, linkPath) {
  const leafSlug = linkPath.pop()
  const leafRe = new RegExp(`^${leafSlug}$`, 'i')
  const leafMatches = nodes.filter(p => p.slug.match(leafRe))

  if (!leafMatches.length) {
    return undefined
  }

  if (leafMatches.length === 1) {
    return leafMatches[0]
  }

  if (!linkPath.length) {
    return undefined
  }

  const paths = linkPath.reverse()
  return leafMatches.find(node => {
    let ctx = node.context
    for (const path of paths) {
      ctx = ctx.throwUntil(item => {
        return item.slug?.match(new RegExp(`^${path}$`, 'i'))
      })
    }
    return !!ctx.items.length
  })
}

function addLinkBack(sourceNode, targetNode, key) {
  if (sourceNode.schema) {
    Object.keys(sourceNode.schema.attributes || []).forEach(schemaKey => {
      const schemaValue = sourceNode.schema.attributes[schemaKey]
      const isSchemaValueArray = Array.isArray(schemaValue)
      const re = new RegExp(`^\\+(${targetNode.contentType}|):${key}$`)
      const match = isSchemaValueArray ?
        schemaValue.find(v => re.test(v)) :
        re.test(schemaValue)
      if (match) {
        if (isSchemaValueArray) {
          // console.log('linking', targetNode.title, 'to', schemaKey, 'field of', sourceNode.title)
          const existingCount = sourceNode.getLinks().filter(link => {
            return link.keyPath.length === 2 && link.keyPath[0] === schemaKey
          }).length
          sourceNode.addLink([schemaKey, existingCount], Object.assign({}, targetNode))
        } else {
          sourceNode.addLink([schemaKey], Object.assign({}, targetNode))
        }
      }
    })
    return
  }
  sourceNode.links = sourceNode.links || {}
  sourceNode.links.relations = sourceNode.links.relations || []
  const relation = sourceNode.links.relations.find(r => r.key === key)
  if (relation) {
    relation.entries.push(targetNode)
  } else {
    sourceNode.links.relations.push({
      key,
      entries: [targetNode]
    })
  }
}

function serializeLinks(node) {
    let decoded = {}
    for (const { keyPath, node: linkedNode } of node.getLinks()) {
      _.set(decoded, keyPath, linkedNode)
    }
    return decoded
}

function resolveLinks(node, nodes) {
  Object.keys(node).forEach(key => {
    const value = node[key]
    if (Array.isArray(value)) {
      for (let i = 0; i < value.length; i++) {
        let valueItem = value[i]
        if (!valueItem.linkPath) {
          continue
        }
        const linkedNode = findLinkedNode(nodes, [...valueItem.linkPath])
        if (linkedNode) {
          node.addLink([key, i], Object.assign({}, linkedNode))
          linkedNode.addLinkBack(node, key)
        }
      }
    } else {
      if (!value?.linkPath) {
        return
      }
      const linkedNode = findLinkedNode(nodes, [...value.linkPath])
      if (linkedNode) {
        node.addLink([key], Object.assign({}, linkedNode))
        linkedNode.addLinkBack(node, key)
      }
    }
  })
}

module.exports = {
  findLinkedNode,
  addLinkBack,
  serializeLinks,
  resolveLinks
}
