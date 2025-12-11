const test = require('tape')
const {
  templateExtensions,
  isTemplateFile,
  isDataFile,
  removeExtension,
  makePermalink,
  makeDateSlug,
  sort,
  Markdown,
  safeStringify
} = require('./contentModelHelpers')

test('templateExtensions', t => {
  t.ok(
    Array.isArray(templateExtensions),
    'is an array'
  )

  t.ok(
    templateExtensions.includes('.hbs'),
    'includes .hbs'
  )

  t.ok(
    templateExtensions.includes('.handlebars'),
    'includes .handlebars'
  )

  t.ok(
    templateExtensions.includes('.md'),
    'includes .md'
  )

  t.ok(
    templateExtensions.includes('.markdown'),
    'includes .markdown'
  )

  t.ok(
    templateExtensions.includes('.txt'),
    'includes .txt'
  )

  t.ok(
    templateExtensions.includes('.text'),
    'includes .text'
  )

  t.ok(
    templateExtensions.includes('.html'),
    'includes .html'
  )

  t.end()
})

test('isTemplateFile', t => {
  t.ok(
    isTemplateFile({ extension: '.hbs' }),
    'recognizes .hbs as template'
  )

  t.ok(
    isTemplateFile({ extension: '.md' }),
    'recognizes .md as template'
  )

  t.ok(
    isTemplateFile({ extension: '.html' }),
    'recognizes .html as template'
  )

  t.ok(
    isTemplateFile({ extension: '.HBS' }),
    'case-insensitive: recognizes .HBS'
  )

  t.ok(
    isTemplateFile({ extension: '.Markdown' }),
    'case-insensitive: recognizes .Markdown'
  )

  t.notOk(
    isTemplateFile({ extension: '.pdf' }),
    'does not recognize .pdf as template'
  )

  t.notOk(
    isTemplateFile({ extension: '.jpg' }),
    'does not recognize .jpg as template'
  )

  t.notOk(
    isTemplateFile({ extension: '' }),
    'does not recognize empty extension'
  )

  t.end()
})

test('isDataFile', t => {
  t.ok(
    isDataFile({ extension: '.json' }),
    'recognizes .json as data file'
  )

  t.ok(
    isDataFile({ extension: '.JSON' }),
    'case-insensitive: recognizes .JSON'
  )

  t.ok(
    isDataFile({ extension: '.Json' }),
    'case-insensitive: recognizes .Json'
  )

  t.notOk(
    isDataFile({ extension: '.csv' }),
    'does not recognize .csv as data file'
  )

  t.notOk(
    isDataFile({ extension: '.xml' }),
    'does not recognize .xml as data file'
  )

  t.notOk(
    isDataFile({ extension: '.txt' }),
    'does not recognize .txt as data file'
  )

  t.notOk(
    isDataFile({ extension: '' }),
    'does not recognize empty extension'
  )

  t.end()
})

test('removeExtension', t => {
  t.equal(
    removeExtension('file.txt'),
    'file',
    'removes single extension'
  )

  t.equal(
    removeExtension('document.md'),
    'document',
    'removes .md extension'
  )

  t.equal(
    removeExtension('archive.tar.gz'),
    'archive.tar',
    'removes only last extension'
  )

  t.equal(
    removeExtension('README'),
    'README',
    'returns unchanged if no extension'
  )

  t.equal(
    removeExtension('.hidden'),
    '.hidden',
    'does not remove leading dot file'
  )

  t.equal(
    removeExtension(''),
    '',
    'handles empty string'
  )

  t.equal(
    removeExtension('file.'),
    'file.',
    'does not remove if extension is only dot'
  )

  t.end()
})

test('makePermalink', t => {
  t.equal(
    makePermalink('blog', 'post', 'my-article'),
    'blog/post/my-article',
    'joins parts with forward slash'
  )

  t.equal(
    makePermalink('/', 'blog', 'post'),
    '/blog/post',
    'handles leading slash'
  )

  t.equal(
    makePermalink('/'),
    '/',
    'returns single slash when only slash provided'
  )

  t.equal(
    makePermalink('home', '', 'page', ''),
    'home/page',
    'filters out empty string parts'
  )

  t.equal(
    makePermalink('single'),
    'single',
    'handles single part'
  )

  t.equal(
    makePermalink(''),
    '',
    'handles all empty parts'
  )

  t.equal(
    makePermalink('/', 'guide', 'getting-started'),
    '/guide/getting-started',
    'combines slash with parts'
  )

  t.end()
})

test('makeDateSlug', t => {
  const date = new Date('2025-11-11')

  t.equal(
    makeDateSlug(date),
    '2025-11-11',
    'converts date to ISO string date portion'
  )

  t.equal(
    makeDateSlug(new Date('2024-01-05')),
    '2024-01-05',
    'handles single digit month and day'
  )

  t.equal(
    makeDateSlug(new Date('2023-12-25')),
    '2023-12-25',
    'handles December date'
  )

  t.end()
})

test('sort with sortOrder 1 (ascending)', t => {
  const stringItems = [
    { name: 'Charlie', value: 30 },
    { name: 'Alice', value: 10 },
    { name: 'Bob', value: 20 }
  ]

  sort(stringItems, 'name', 1)

  t.equal(
    stringItems[0].name,
    'Alice',
    'sorts strings in ascending order'
  )

  t.equal(
    stringItems[1].name,
    'Bob',
    'maintains correct middle order'
  )

  t.equal(
    stringItems[2].name,
    'Charlie',
    'maintains correct last order'
  )

  const numItems = [
    { name: 'a', value: 30 },
    { name: 'b', value: 10 },
    { name: 'c', value: 20 }
  ]

  sort(numItems, 'value', 1)

  t.equal(
    numItems[0].value,
    10,
    'sorts numbers in ascending order'
  )

  t.equal(
    numItems[1].value,
    20,
    'maintains correct numeric middle order'
  )

  t.equal(
    numItems[2].value,
    30,
    'maintains correct numeric last order'
  )

  t.end()
})

test('sort with sortOrder -1 (descending)', t => {
  const stringItems = [
    { name: 'Charlie', value: 30 },
    { name: 'Alice', value: 10 },
    { name: 'Bob', value: 20 }
  ]

  sort(stringItems, 'name', -1)

  t.equal(
    stringItems[0].name,
    'Charlie',
    'sorts strings in descending order'
  )

  t.equal(
    stringItems[1].name,
    'Bob',
    'maintains correct middle order'
  )

  t.equal(
    stringItems[2].name,
    'Alice',
    'maintains correct last order'
  )

  const numItems = [
    { name: 'a', value: 30 },
    { name: 'b', value: 10 },
    { name: 'c', value: 20 }
  ]

  sort(numItems, 'value', -1)

  t.equal(
    numItems[0].value,
    30,
    'sorts numbers in descending order'
  )

  t.equal(
    numItems[1].value,
    20,
    'maintains correct numeric middle order'
  )

  t.equal(
    numItems[2].value,
    10,
    'maintains correct numeric last order'
  )

  t.end()
})

test('sort consistency between strings and numbers', t => {
  const mixedItems = [
    { label: 'First', priority: 3 },
    { label: 'Third', priority: 1 },
    { label: 'Second', priority: 2 }
  ]

  sort(mixedItems, 'label', 1)

  t.equal(
    mixedItems[0].label,
    'First',
    'ascending sort works for strings'
  )

  sort(mixedItems, 'priority', 1)

  t.equal(
    mixedItems[0].priority,
    1,
    'ascending sort works for numbers with same sortOrder'
  )

  t.end()
})

test('sort case-insensitive', t => {
  const items = [
    { name: 'charlie' },
    { name: 'Alice' },
    { name: 'Bob' }
  ]

  sort(items, 'name', 1)

  t.equal(
    items[0].name,
    'Alice',
    'uppercase and lowercase treated the same in ascending order'
  )

  t.equal(
    items[1].name,
    'Bob',
    'maintains correct middle order regardless of case'
  )

  t.equal(
    items[2].name,
    'charlie',
    'maintains correct last order regardless of case'
  )

  t.end()
})

test('sort case-insensitive descending', t => {
  const items = [
    { name: 'alice' },
    { name: 'Charlie' },
    { name: 'bob' }
  ]

  sort(items, 'name', -1)

  t.equal(
    items[0].name,
    'Charlie',
    'uppercase and lowercase treated the same in descending order'
  )

  t.equal(
    items[1].name,
    'bob',
    'maintains correct middle order regardless of case'
  )

  t.equal(
    items[2].name,
    'alice',
    'maintains correct last order regardless of case'
  )

  t.end()
})

test('sort with empty array', t => {
  const items = []

  sort(items, 'name', 1)

  t.equal(
    items.length,
    0,
    'handles empty array without error'
  )

  t.end()
})

test('sort with single item', t => {
  const items = [
    { name: 'Alice' }
  ]

  sort(items, 'name', 1)

  t.equal(
    items[0].name,
    'Alice',
    'single item remains unchanged'
  )

  t.equal(
    items.length,
    1,
    'maintains single item array length'
  )

  t.end()
})

test('sort with identical values', t => {
  const items = [
    { name: 'Alice', id: 1 },
    { name: 'Alice', id: 2 },
    { name: 'Alice', id: 3 }
  ]

  sort(items, 'name', 1)

  t.deepEqual(
    items.map(i => i.id),
    [1, 2, 3],
    'preserves original order when all sort keys are identical'
  )

  t.end()
})

test('Markdown.parse', t => {
  const headingResult = Markdown.parse('# Hello World')

  t.ok(
    headingResult.includes('<h1') &&
    headingResult.includes('Hello World') &&
    headingResult.includes('</h1>'),
    'converts markdown heading to HTML with h1 tags'
  )

  t.ok(
    Markdown.parse('**bold text**').includes('<strong>bold text</strong>'),
    'converts markdown bold to HTML'
  )

  t.ok(
    Markdown.parse('_italic text_').includes('<em>italic text</em>'),
    'converts markdown italic to HTML'
  )

  t.ok(
    Markdown.parse('- item 1\n- item 2').includes('<li>'),
    'converts markdown list to HTML'
  )

  t.ok(
    Markdown.parse('').length >= 0,
    'handles empty string'
  )

  t.end()
})

test('Markdown.parse removes zero-width characters', t => {
  const zeroWidthText = '\u200B# Heading'

  const result = Markdown.parse(zeroWidthText)

  t.notOk(
    result.includes('\u200B'),
    'removes zero-width space'
  )

  t.end()
})

test('Markdown.unescapeHandlebarsExpressions', t => {
  const escaped = '{{&gt; partial}}'

  t.ok(
    Markdown.unescapeHandlebarsExpressions(escaped).includes('{{>'),
    'unescapes partial greater sign'
  )

  const helperEscaped = '{{helper &quot;value&quot; extra}}'

  t.ok(
    Markdown.unescapeHandlebarsExpressions(helperEscaped).includes('{{helper "value"'),
    'unescapes helper quote entities'
  )

  const partialEscaped = '{{> partial &quot;arg&quot; more}}'

  t.ok(
    Markdown.unescapeHandlebarsExpressions(partialEscaped).includes('{{> partial'),
    'unescapes partial quote entities'
  )

  const noEscapes = '{{normal}}'

  t.equal(
    Markdown.unescapeHandlebarsExpressions(noEscapes),
    '{{normal}}',
    'leaves normal expressions unchanged'
  )

  t.end()
})

test('safeStringify basic usage', t => {
  const data = {
    name: 'John',
    age: 30,
    email: 'john@example.com'
  }

  const result = safeStringify({ data })

  t.equal(
    result,
    '{"name":"John","age":30,"email":"john@example.com"}',
    'stringifies object to valid JSON'
  )

  t.end()
})

test('safeStringify with omit', t => {
  const data = {
    name: 'John',
    password: 'secret123',
    email: 'john@example.com'
  }

  const result = safeStringify({ data, omit: ['password'] })

  t.equal(
    result,
    '{"name":"John","email":"john@example.com"}',
    'omits password field from stringified output'
  )

  t.end()
})

test('safeStringify with circular references', t => {
  const data = { name: 'John' }
  data.self = data

  const result = safeStringify({ data, stub: ['name'] })

  t.equal(
    result,
    '{"name":"John","self":{"name":"John"}}',
    'handles circular references and stubs correctly'
  )

  t.end()
})

test('safeStringify with nested objects', t => {
  const data = {
    user: {
      name: 'John',
      profile: {
        bio: 'Developer'
      }
    }
  }

  const result = safeStringify({ data })

  t.equal(
    result,
    '{"user":{"name":"John","profile":{"bio":"Developer"}}}',
    'stringifies nested objects correctly'
  )

  t.end()
})

test('safeStringify with arrays', t => {
  const data = {
    items: ['a', 'b', 'c'],
    count: 3
  }

  const result = safeStringify({ data })

  t.equal(
    result,
    '{"items":["a","b","c"],"count":3}',
    'stringifies arrays correctly'
  )

  t.end()
})

test('safeStringify with null and undefined', t => {
  const data = {
    nullValue: null,
    undefinedValue: undefined,
    emptyString: ''
  }

  const result = safeStringify({ data })

  t.equal(
    result,
    '{"nullValue":null,"emptyString":""}',
    'handles null and omits undefined in output'
  )

  t.end()
})
