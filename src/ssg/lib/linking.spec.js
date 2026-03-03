const test = require('tape')
const ImmutableStack = require('./ImmutableStack')
const {
  findLinkedNode,
  findClosestNode,
  addLinkBack,
  serializeLinks,
  resolveLinks
} = require('./linking')

function makeNode({ slug, context = [], ...extras } = {}) {
  const node = {
    slug,
    context: new ImmutableStack(context),
    __links: [],
    getLinks() {
      return this.__links
    },
    addLink(keyPath, linkedNode) {
      this.__links.push({ keyPath, node: linkedNode })
    },
    addLinkBack(sourceNode, key) {
      addLinkBack(this, sourceNode, key)
    },
    clone() {
      return Object.assign(Object.create(Object.getPrototypeOf(this)), this)
    },
    ...extras
  }
  return node
}

test('findLinkedNode', t => {
  t.test('returns undefined when no nodes match', t => {
    const source = makeNode({ slug: 'source' })
    const result = findLinkedNode(source, [], ['target'])
    t.equal(result, undefined, 'no match in empty list')
    t.end()
  })

  t.test('returns the single match', t => {
    const source = makeNode({ slug: 'source' })
    const target = makeNode({ slug: 'target' })
    const result = findLinkedNode(source, [target], ['target'])
    t.equal(result, target, 'returns the only matching node')
    t.end()
  })

  t.test('matches case-insensitively', t => {
    const source = makeNode({ slug: 'source' })
    const target = makeNode({ slug: 'my-post' })
    const result = findLinkedNode(source, [target], ['My-Post'])
    t.equal(result, target, 'matches regardless of case')
    t.end()
  })

  t.test('does not mutate the linkPath argument', t => {
    const source = makeNode({ slug: 'source' })
    const target = makeNode({ slug: 'leaf' })
    const linkPath = ['parent', 'leaf']
    findLinkedNode(source, [target], linkPath)
    t.deepEqual(linkPath, ['parent', 'leaf'], 'linkPath is unchanged')
    t.end()
  })

  t.test('falls back to closest node with multiple matches', t => {
    const blogContext = [{ slug: 'blog' }]
    const newsContext = [{ slug: 'news' }]
    const source = makeNode({ slug: 'source', context: blogContext })
    const far = makeNode({ slug: 'post', context: newsContext })
    const close = makeNode({ slug: 'post', context: blogContext })
    const result = findLinkedNode(source, [far, close], ['post'])
    t.equal(result, close, 'picks the node sharing more context')
    t.end()
  })

  t.test('disambiguates by ancestor path', t => {
    const blogContext = [{ slug: 'blog' }]
    const newsContext = [{ slug: 'news' }]
    const source = makeNode({ slug: 'source' })
    const blogPost = makeNode({ slug: 'post', context: blogContext })
    const newsPost = makeNode({ slug: 'post', context: newsContext })
    const result = findLinkedNode(source, [blogPost, newsPost], ['blog', 'post'])
    t.equal(result, blogPost, 'matches the node whose context contains the ancestor')
    t.end()
  })

  t.test('ancestor disambiguation is case-insensitive', t => {
    const context = [{ slug: 'blog' }]
    const source = makeNode({ slug: 'source' })
    const blogPost = makeNode({ slug: 'post', context })
    const newsPost = makeNode({ slug: 'post', context: [{ slug: 'news' }] })
    const result = findLinkedNode(source, [blogPost, newsPost], ['Blog', 'post'])
    t.equal(result, blogPost, 'ancestor match ignores case')
    t.end()
  })

  t.end()
})

test('findClosestNode', t => {
  t.test('returns undefined when candidates are tied', t => {
    const source = makeNode({
      slug: 'source',
      context: [{ slug: 'root' }, { slug: 'blog' }]
    })
    const candidateA = makeNode({
      slug: 'x',
      context: [{ slug: 'root' }, { slug: 'a' }]
    })
    const candidateB = makeNode({
      slug: 'x',
      context: [{ slug: 'root' }, { slug: 'b' }]
    })
    const result = findClosestNode(source, [candidateA, candidateB])
    t.equal(result, undefined, 'gives up when tied')
    t.end()
  })

  t.test('picks candidate with deepest shared context', t => {
    const source = makeNode({
      slug: 'source',
      context: [{ slug: 'root' }, { slug: 'blog' }]
    })
    const shallow = makeNode({
      slug: 'post',
      context: [{ slug: 'root' }]
    })
    const deep = makeNode({
      slug: 'post',
      context: [{ slug: 'root' }, { slug: 'blog' }]
    })
    const result = findClosestNode(source, [shallow, deep])
    t.equal(result, deep, 'higher overlap score wins')
    t.end()
  })

  t.test('ignores out-of-order matches after a break in the path', t => {
    const source = makeNode({
      slug: 'source',
      context: [
        { slug: 'a' }, { slug: 'b' }, { slug: 'c' },
        { slug: 'd' }, { slug: 'e' }
      ]
    })
    const moreScatteredMatches = makeNode({
      slug: 'x',
      context: [
        { slug: 'a' }, { slug: 'z' }, { slug: 'c' },
        { slug: 'd' }, { slug: 'e' }
      ]
    })
    const fewerContiguousMatches = makeNode({
      slug: 'x',
      context: [
        { slug: 'a' }, { slug: 'b' }, { slug: 'z' },
        { slug: 'z' }, { slug: 'z' }
      ]
    })
    const result = findClosestNode(
      source,
      [moreScatteredMatches, fewerContiguousMatches]
    )
    t.equal(
      result,
      fewerContiguousMatches,
      'contiguous path from root beats scattered matches'
    )
    t.end()
  })

  t.end()
})

test('addLinkBack', t => {
  t.test('creates relation for schema-less node', t => {
    const source = makeNode({ slug: 'source' })
    const target = makeNode({ slug: 'target' })
    addLinkBack(source, target, 'author')
    t.equal(
      source.links.relations.length,
      1,
      'one relation created'
    )

    t.equal(
      source.links.relations[0].key,
      'author',
      'relation has correct key'
    )

    t.equal(
      source.links.relations[0].entries[0],
      target,
      'relation contains the target node'
    )
    t.end()
  })

  t.test('appends to existing relation with same key', t => {
    const source = makeNode({ slug: 'source' })
    const targetA = makeNode({ slug: 'a' })
    const targetB = makeNode({ slug: 'b' })
    addLinkBack(source, targetA, 'tag')
    addLinkBack(source, targetB, 'tag')
    t.equal(
      source.links.relations.length,
      1,
      'still one relation'
    )

    t.equal(
      source.links.relations[0].entries.length,
      2,
      'two entries under same key'
    )
    t.end()
  })

  t.test('creates separate relations for different keys', t => {
    const source = makeNode({ slug: 'source' })
    addLinkBack(source, makeNode({ slug: 'a' }), 'author')
    addLinkBack(source, makeNode({ slug: 'b' }), 'tag')
    t.equal(
      source.links.relations.length,
      2,
      'two distinct relations'
    )
    t.end()
  })

  t.test('adds link via schema for single-value attribute', t => {
    const source = makeNode({
      slug: 'alice',
      contentType: 'Person',
      schema: {
        attributes: {
          twin: '+Person:twin'
        }
      }
    })
    const target = makeNode({
      slug: 'bob',
      contentType: 'Person'
    })
    addLinkBack(source, target, 'twin')
    t.equal(source.getLinks().length, 1, 'one link added')

    t.deepEqual(
      source.getLinks()[0].keyPath,
      ['twin'],
      'keyPath matches schema attribute name'
    )

    t.equal(
      source.getLinks()[0].node.slug,
      'bob',
      'back-link points to the target node'
    )
    t.end()
  })

  t.test('adds link via schema for array attribute', t => {
    const source = makeNode({
      slug: 'alice',
      contentType: 'Person',
      schema: {
        attributes: {
          articles: ['+Article:author']
        }
      }
    })
    const targetA = makeNode({ slug: 'first-post', contentType: 'Article' })
    const targetB = makeNode({ slug: 'second-post', contentType: 'Article' })
    addLinkBack(source, targetA, 'author')
    addLinkBack(source, targetB, 'author')
    t.equal(source.getLinks().length, 2, 'two links added')

    t.equal(
      source.getLinks()[0].node.slug,
      'first-post',
      'first article linked at index 0'
    )

    t.equal(
      source.getLinks()[1].node.slug,
      'second-post',
      'second article linked at index 1'
    )
    t.end()
  })

  t.test('skips when schema attribute does not match', t => {
    const source = makeNode({
      slug: 'alice',
      contentType: 'Person',
      schema: {
        attributes: {
          articles: ['+Article:author']
        }
      }
    })
    const target = makeNode({
      slug: 'first-post',
      contentType: 'Article'
    })
    addLinkBack(source, target, 'reviewer')
    t.equal(source.getLinks().length, 0, 'no links added')
    t.end()
  })

  t.end()
})

test('serializeLinks', t => {
  t.test('returns empty object when no links', t => {
    const node = makeNode({ slug: 'source' })
    const result = serializeLinks(node)
    t.deepEqual(result, {}, 'empty with no links')
    t.end()
  })

  t.test('serializes single-level keyPath', t => {
    const node = makeNode({ slug: 'source' })
    node.addLink(['author'], { title: 'Alice' })
    const result = serializeLinks(node)
    t.deepEqual(
      result,
      { author: { title: 'Alice' } },
      'sets value at key'
    )
    t.end()
  })

  t.test('serializes nested keyPath', t => {
    const node = makeNode({ slug: 'source' })
    node.addLink(['tags', 0], { title: 'js' })
    node.addLink(['tags', 1], { title: 'node' })
    const result = serializeLinks(node)
    t.deepEqual(
      result,
      { tags: [{ title: 'js' }, { title: 'node' }] },
      'builds array from indexed keyPaths'
    )
    t.end()
  })

  t.end()
})

test('resolveLinks', t => {
  t.test('resolves single-value link', t => {
    const target = makeNode({ slug: 'target' })
    const node = makeNode({
      slug: 'source',
      author: { linkPath: ['target'] }
    })
    resolveLinks(node, [target])
    t.equal(node.getLinks().length, 1, 'link added to source')

    t.equal(
      node.getLinks()[0].node.slug,
      'target',
      'linked node is the resolved target'
    )
    t.end()
  })

  t.test('resolves array of links', t => {
    const tagA = makeNode({ slug: 'js' })
    const tagB = makeNode({ slug: 'node' })
    const node = makeNode({
      slug: 'source',
      tags: [
        { linkPath: ['js'] },
        { linkPath: ['node'] }
      ]
    })
    resolveLinks(node, [tagA, tagB])
    t.equal(node.getLinks().length, 2, 'both links resolved')

    t.equal(
      node.getLinks()[0].node.slug,
      'js',
      'first link resolves to js'
    )

    t.equal(
      node.getLinks()[1].node.slug,
      'node',
      'second link resolves to node'
    )
    t.end()
  })

  t.test('skips non-link properties', t => {
    const node = makeNode({
      slug: 'source',
      title: 'Hello',
      count: 42
    })
    resolveLinks(node, [])
    t.equal(node.getLinks().length, 0, 'no links created for plain properties')
    t.end()
  })

  t.test('skips array items without linkPath', t => {
    const target = makeNode({ slug: 'found' })
    const node = makeNode({
      slug: 'source',
      tags: [
        { name: 'plain' },
        { linkPath: ['found'] }
      ]
    })
    resolveLinks(node, [target])
    t.equal(node.getLinks().length, 1, 'only the link item resolved')

    t.equal(
      node.getLinks()[0].node.slug,
      'found',
      'resolved the link item'
    )
    t.end()
  })

  t.test('skips when linked node not found', t => {
    const node = makeNode({
      slug: 'source',
      author: { linkPath: ['nonexistent'] }
    })
    resolveLinks(node, [])
    t.equal(node.getLinks().length, 0, 'no links when target missing')
    t.end()
  })

  t.end()
})