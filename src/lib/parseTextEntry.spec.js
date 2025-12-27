const test = require('tape')
const {
  parseLinkValue,
  parseLinkedFields,
  parseContent,
  normalizeEntryName,
  parseFlatData,
  parseTextEntry
} = require('./parseTextEntry')

test('parseLinkValue removes leading plus and splits by slash', (t) => {
  const value = '+folder/subfolder/item'

  const result = parseLinkValue(value)

  t.deepEqual(
    result,
    ['folder', 'subfolder', 'item'],
    'removes plus and splits by slash'
  )

  t.end()
})

test('parseLinkValue handles single segment path', (t) => {
  const value = '+folder'

  const result = parseLinkValue(value)

  t.deepEqual(
    result,
    ['folder'],
    'returns array with single segment'
  )

  t.end()
})

test('parseLinkValue filters out empty segments', (t) => {
  const value = '+folder//item'

  const result = parseLinkValue(value)

  t.deepEqual(
    result,
    ['folder', 'item'],
    'removes empty segments from consecutive slashes'
  )

  t.end()
})

test('parseLinkValue preserves case sensitivity', (t) => {
  const value = '+PEOPLE/users/ADMINS/john/PROFILE'

  const result = parseLinkValue(value)

  t.deepEqual(
    result,
    ['PEOPLE', 'users', 'ADMINS', 'john', 'PROFILE'],
    'preserves mixed case with uppercase and lowercase segments'
  )

  t.end()
})

test('parseLinkValue ignores trailing slash', (t) => {
  const value = '+folder/subfolder/'

  const result = parseLinkValue(value)

  t.deepEqual(
    result,
    ['folder', 'subfolder'],
    'filters out empty segment from trailing slash'
  )

  t.end()
})

test('parseLinkedFields converts single string linked field', (t) => {
  const fields = { author: '+people/users/admins/john' }

  const result = parseLinkedFields(fields)

  t.deepEqual(
    result.author,
    { key: 'author', linkPath: ['people', 'users', 'admins', 'john'] },
    'converts linked field with multiple path segments'
  )

  t.end()
})

test('parseLinkedFields converts array of linked fields', (t) => {
  const fields = { tags: ['+categories/tech/frontend/react', '+categories/js/backend/node'] }

  const result = parseLinkedFields(fields)

  t.deepEqual(
    result.tags[0],
    { key: 'tags', linkPath: ['categories', 'tech', 'frontend', 'react'] },
    'converts first array element with deep path'
  )

  t.deepEqual(
    result.tags[1],
    { key: 'tags', linkPath: ['categories', 'js', 'backend', 'node'] },
    'converts second array element with deep path'
  )

  t.end()
})

test('parseLinkedFields preserves non-linked string fields', (t) => {
  const fields = { title: 'My Title', description: 'Plain text' }

  const result = parseLinkedFields(fields)

  t.equal(
    result.title,
    'My Title',
    'preserves non-linked string field'
  )

  t.equal(
    result.description,
    'Plain text',
    'preserves other non-linked fields'
  )

  t.end()
})

test('parseLinkedFields converts only the linked items in mixed arrays', (t) => {
  const fields = { mixed: ['+category/tech', 'plain-text', '+category/other'] }

  const result = parseLinkedFields(fields)

  t.deepEqual(
    result.mixed[0],
    { key: 'mixed', linkPath: ['category', 'tech'] },
    'converts first linked field'
  )

  t.equal(
    result.mixed[1],
    'plain-text',
    'preserves non-linked item'
  )

  t.deepEqual(
    result.mixed[2],
    { key: 'mixed', linkPath: ['category', 'other'] },
    'converts linked field that comes after non-linked item'
  )

  t.end()
})

test('parseLinkedFields handles mix of linked and non-linked fields', (t) => {
  const fields = {
    author: '+users/john',
    title: 'Article Title',
    tags: ['+tags/featured', '+tags/new'],
    description: 'An article'
  }

  const result = parseLinkedFields(fields)

  t.deepEqual(
    result.author,
    { key: 'author', linkPath: ['users', 'john'] },
    'converts linked field'
  )

  t.equal(
    result.title,
    'Article Title',
    'preserves non-linked string'
  )

  t.deepEqual(
    result.tags[0],
    { key: 'tags', linkPath: ['tags', 'featured'] },
    'converts first array element'
  )

  t.deepEqual(
    result.tags[1],
    { key: 'tags', linkPath: ['tags', 'new'] },
    'converts second array element'
  )

  t.equal(
    result.description,
    'An article',
    'preserves non-linked fields among linked ones'
  )

  t.end()
})

test('parseContent returns content as-is for HTML files', (t) => {
  const node = { extension: '.html' }
  const content = '<div>HTML content</div>'

  const result = parseContent(node, content)

  t.equal(
    result,
    content,
    'returns original HTML without parsing'
  )

  t.end()
})

test('parseContent returns content as-is for HTM files', (t) => {
  const node = { extension: '.htm' }
  const content = '<p>Some HTM content</p>'

  const result = parseContent(node, content)

  t.equal(
    result,
    content,
    'returns original HTM without parsing'
  )

  t.end()
})

test('parseContent returns content as-is for HBS files', (t) => {
  const node = { extension: '.hbs' }
  const content = '{{#if user}}Hello {{user.name}}{{/if}}'

  const result = parseContent(node, content)

  t.equal(
    result,
    content,
    'returns original Handlebars without parsing'
  )

  t.end()
})

test('parseContent returns content as-is for HANDLEBARS files', (t) => {
  const node = { extension: '.handlebars' }
  const content = '{{> partialName}}'

  const result = parseContent(node, content)

  t.equal(
    result,
    content,
    'returns original Handlebars without parsing'
  )

  t.end()
})

test('parseContent is case-insensitive for HTML extension', (t) => {
  const node = { extension: '.HTML' }
  const content = '<span>uppercase HTML</span>'

  const result = parseContent(node, content)

  t.equal(
    result,
    content,
    'treats uppercase .HTML extension as non-markdown'
  )

  t.end()
})

test('parseContent parses markdown for MD files', (t) => {
  const node = { extension: '.md' }
  const content = '# Title\n\n**bold text**'

  const result = parseContent(node, content)

  t.ok(
    result.includes('<h1'),
    'parses markdown to HTML'
  )

  t.ok(
    result.includes('<strong>bold text</strong>'),
    'converts markdown formatting'
  )

  t.end()
})

test('parseContent parses markdown for TXT files', (t) => {
  const node = { extension: '.txt' }
  const content = '## Section\n\n- Item 1\n- Item 2'

  const result = parseContent(node, content)

  t.notEqual(
    result,
    content,
    'parses TXT content as markdown'
  )

  t.ok(
    result.includes('<h2'),
    'converts markdown to HTML'
  )

  t.end()
})

test('normalizeEntryName detects index file pattern', (t) => {
  const fsNode = { name: 'blog' }
  const indexNode = { name: 'index.md' }

  const result = normalizeEntryName(fsNode, indexNode)

  t.ok(
    result.hasIndex,
    'hasIndex is true when fsNode and indexNode are different'
  )

  t.equal(
    result.entryName,
    'blog',
    'entryName is fsNode.name when there is an index'
  )

  t.end()
})

test('normalizeEntryName detects single file pattern', (t) => {
  const node = { name: 'about.md' }
  const fsNode = node
  const indexNode = node

  const result = normalizeEntryName(fsNode, indexNode)

  t.notOk(
    result.hasIndex,
    'hasIndex is false when fsNode and indexNode are the same reference'
  )

  t.equal(
    result.entryName,
    'about',
    'entryName removes extension from indexNode.name'
  )

  t.end()
})

test('normalizeEntryName handles files with multiple extensions', (t) => {
  const node = { name: 'archive.tar.md' }
  const fsNode = node
  const indexNode = node

  const result = normalizeEntryName(fsNode, indexNode)

  t.equal(
    result.entryName,
    'archive.tar',
    'removes only the final extension'
  )

  t.end()
})

test('normalizeEntryName handles files without extensions', (t) => {
  const node = { name: 'README' }
  const fsNode = node
  const indexNode = node

  const result = normalizeEntryName(fsNode, indexNode)

  t.equal(
    result.entryName,
    'README',
    'returns name unchanged when no extension'
  )

  t.end()
})

test('parseFlatData returns all data fields spread in result', (t) => {
  const data = {
    title: 'Test Post',
    slug: 'test-post',
    customField: 'custom value',
    nested: { foo: 'bar' }
  }

  const result = parseFlatData(data)

  t.deepEqual(
    result.customField,
    'custom value',
    'includes custom fields from data'
  )

  t.deepEqual(
    result.nested,
    { foo: 'bar' },
    'includes nested objects from data'
  )

  t.end()
})

test('parseFlatData hardcodes hasIndex to false', (t) => {
  const data = { title: 'Test' }

  const result = parseFlatData(data)

  t.notOk(
    result.hasIndex,
    'hasIndex is false'
  )

  t.end()
})

test('parseFlatData guarantees empty title field', (t) => {
  const data = {}

  const result = parseFlatData(data)

  t.equal(
    result.title,
    '',
    'title defaults to empty string when not provided'
  )

  t.end()
})

test('parseFlatData preserves provided title', (t) => {
  const data = { title: 'My Title' }

  const result = parseFlatData(data)

  t.equal(
    result.title,
    'My Title',
    'uses provided title'
  )

  t.end()
})

test('parseFlatData generates slug from title when slug not provided', (t) => {
  const data = { title: 'Hello World Post' }

  const result = parseFlatData(data)

  t.equal(
    result.slug,
    'hello-world-post',
    'generates slug from title'
  )

  t.end()
})

test('parseFlatData preserves slug when provided', (t) => {
  const data = { title: 'Hello World', slug: 'custom-slug' }

  const result = parseFlatData(data)

  t.equal(
    result.slug,
    'custom-slug',
    'uses provided slug instead of generating from title'
  )

  t.end()
})

test('parseFlatData handles empty content field', (t) => {
  const data = { title: 'Test', content: '' }

  const result = parseFlatData(data)

  t.equal(
    result.contentRaw,
    '',
    'contentRaw is empty string'
  )

  t.ok(
    typeof result.content === 'string',
    'content is a string'
  )

  t.end()
})

test('parseFlatData handles missing content field', (t) => {
  const data = { title: 'Test' }

  const result = parseFlatData(data)

  t.equal(
    result.contentRaw,
    '',
    'contentRaw defaults to empty string'
  )

  t.ok(
    typeof result.content === 'string',
    'content is a string'
  )

  t.end()
})

test('parseFlatData parses markdown content', (t) => {
  const data = { title: 'Test', content: '# Heading\n\nThis is **bold**' }

  const result = parseFlatData(data)

  t.equal(
    result.contentRaw,
    '# Heading\n\nThis is **bold**',
    'contentRaw preserves original markdown'
  )

  t.ok(
    result.content.includes('<h1'),
    'content is parsed to HTML'
  )

  t.ok(
    result.content.includes('<strong>bold</strong>'),
    'markdown formatting is converted to HTML'
  )

  t.end()
})

test('parseFlatData returns separate raw and parsed content', (t) => {
  const markdown = '## Section\n\n- List item 1\n- List item 2'
  const data = { title: 'Test', content: markdown }

  const result = parseFlatData(data)

  t.notEqual(
    result.contentRaw,
    result.content,
    'raw and parsed content are different'
  )

  t.equal(
    result.contentRaw,
    markdown,
    'raw content matches input exactly'
  )

  t.end()
})

test('parseFlatData handles content with front-matter-like syntax', (t) => {
  const data = {
    title: 'Test',
    content: '---\nauthor: John\n---\n\nBody text'
  }

  const result = parseFlatData(data)

  t.equal(
    result.contentRaw,
    '---\nauthor: John\n---\n\nBody text',
    'does not parse front-matter, treats entire content as markdown'
  )

  t.ok(
    result.content.includes('Body text'),
    'front-matter syntax is treated as markdown content'
  )

  t.end()
})


test('parseTextEntry delegates to parseFlatData when isFlatData is true', (t) => {
  const data = {
    title: 'Flat Entry',
    content: '# Content'
  }

  const result = parseTextEntry(data, null, true)

  t.equal(
    result.title,
    'Flat Entry',
    'returns result from parseFlatData'
  )

  t.notOk(
    result.hasIndex,
    'hasIndex is false from parseFlatData'
  )

  t.end()
})

test('parseTextEntry extracts front-matter from content', (t) => {
  const fsNode = { name: 'post.md', custom: 'value' }
  const indexNode = {
    name: 'post.md',
    extension: '.md',
    content: '---\ntitle: My Post\nauthor: John\n---\n\nBody text'
  }

  const result = parseTextEntry(fsNode, indexNode, false)

  t.equal(
    result.title,
    'My Post',
    'uses title from front-matter'
  )

  t.equal(
    result.author,
    'John',
    'includes custom attributes from front-matter'
  )

  t.end()
})

test('parseTextEntry uses entryName when title is missing from front-matter', (t) => {
  const indexNode = {
    name: 'guide.md',
    extension: '.md',
    content: '---\nauthor: Jane\n---\n\nContent here'
  }
  const fsNode = indexNode

  const result = parseTextEntry(fsNode, indexNode, false)

  t.equal(
    result.title,
    'guide',
    'falls back to entryName when title not in front-matter'
  )

  t.end()
})

test('parseTextEntry uses slug from front-matter when provided', (t) => {
  const fsNode = { name: 'post.md' }
  const indexNode = {
    name: 'post.md',
    extension: '.md',
    content: '---\ntitle: Blog Post\nslug: custom-slug\n---\n\nContent'
  }

  const result = parseTextEntry(fsNode, indexNode, false)

  t.equal(
    result.slug,
    'custom-slug',
    'uses slug from front-matter attributes'
  )

  t.end()
})

test('parseTextEntry generates slug from entryName when not in front-matter', (t) => {
  const indexNode = {
    name: 'my post.md',
    extension: '.md',
    content: '---\ntitle: A Blog Post\n---\n\nContent'
  }
  const fsNode = indexNode

  const result = parseTextEntry(fsNode, indexNode, false)

  t.equal(
    result.slug,
    'my-post',
    'generates slug from entryName'
  )

  t.end()
})

test('parseTextEntry spreads fsNode properties', (t) => {
  const fsNode = {
    name: 'entry.md',
    custom: 'custom-value',
    nested: { key: 'value' }
  }
  const indexNode = {
    name: 'entry.md',
    extension: '.md',
    content: 'Just content'
  }

  const result = parseTextEntry(fsNode, indexNode, false)

  t.equal(
    result.custom,
    'custom-value',
    'includes custom fsNode properties'
  )

  t.deepEqual(
    result.nested,
    { key: 'value' },
    'includes nested fsNode properties'
  )

  t.end()
})

test('parseTextEntry omits children from fsNode', (t) => {
  const fsNode = {
    name: 'folder',
    children: [{ name: 'child.md' }]
  }
  const indexNode = {
    name: 'index.md',
    extension: '.md',
    content: 'Content'
  }

  const result = parseTextEntry(fsNode, indexNode, false)

  t.notOk(
    result.children,
    'children property is omitted from result'
  )

  t.end()
})

test('parseTextEntry handles empty front-matter body', (t) => {
  const fsNode = { name: 'file.md' }
  const indexNode = {
    name: 'file.md',
    extension: '.md',
    content: '---\ntitle: Title\n---\n'
  }

  const result = parseTextEntry(fsNode, indexNode, false)

  t.equal(
    result.contentRaw,
    '',
    'contentRaw is empty string when body is missing'
  )

  t.ok(
    typeof result.content === 'string',
    'content is still a string'
  )

  t.end()
})

test('parseTextEntry parses content based on file extension', (t) => {
  const fsNode = { name: 'page.md' }
  const indexNode = {
    name: 'page.md',
    extension: '.md',
    content: '---\ntitle: Page\n---\n\n# Heading'
  }

  const result = parseTextEntry(fsNode, indexNode, false)

  t.ok(
    result.content.includes('<h1'),
    'markdown is parsed to HTML for .md extension'
  )

  t.end()
})

test('parseTextEntry returns HTML as-is for handlebars files', (t) => {
  const fsNode = { name: 'template.hbs' }
  const indexNode = {
    name: 'template.hbs',
    extension: '.hbs',
    content: '---\ntitle: Template\n---\n\n{{#if show}}Content _and_ bla bla{{/if}}'
  }

  const result = parseTextEntry(fsNode, indexNode, false)

  t.equal(
    result.content,
    '{{#if show}}Content _and_ bla bla{{/if}}',
    'handlebars content is not parsed as markdown'
  )

  t.end()
})

test('parseTextEntry detects folder with index file pattern', (t) => {
  const fsNode = { name: 'blog', custom: 'folderProp' }
  const indexNode = {
    name: 'index.md',
    extension: '.md',
    content: '---\ntitle: Blog\n---\n\nContent'
  }

  const result = parseTextEntry(fsNode, indexNode, false)

  t.ok(
    result.hasIndex,
    'hasIndex is true for folder with index file'
  )

  t.equal(
    result.title,
    'Blog',
    'uses front-matter title'
  )

  t.equal(
    result.custom,
    'folderProp',
    'includes folder properties'
  )

  t.end()
})
