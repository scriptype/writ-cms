const { tmpdir } = require('os')
const { rm, mkdtemp, mkdir } = require('fs/promises')
const { resolve, join } = require('path')
const test = require('tape')
const { contentRoot, makePermalink, maybeRawHTMLType } = require('../helpers')

const tempDir = () => {
  return mkdtemp(join(tmpdir(), 'writ-test-'))
}

test('helpers', t => {
  t.test('contentRoot', async () => {
    try {
      await contentRoot()
      t.fail('if rootDirectory parameter is missing, throws exception')
    } catch (e) {
      t.pass('if rootDirectory parameter is missing, throws exception')
    }

    const dir1 = await tempDir()
    t.teardown(() => {
      rm(dir1, { recursive: true })
    })
    const actual1 = await contentRoot(resolve(dir1))
    const expected1 = resolve(dir1)
    t.equal(
      actual1,
      expected1,
      'if contentDirectory parameter is missing, contentRootPath is rootDirectory'
    )

    const dir2 = await tempDir()
    t.teardown(() => {
      rm(dir2, { recursive: true })
    })
    const actual2 = await contentRoot(resolve(dir2), 'content')
    const expected2 = resolve(dir2)
    t.equal(
      actual2,
      expected2,
      'if contentDirectory is not found, contentRootPath is rootDirectory'
    )

    const dir3 = await tempDir()
    await mkdir(join(dir3, 'content'))
    t.teardown(() => {
      rm(dir3, { recursive: true })
    })
    const actual3 = await contentRoot(resolve(dir3), 'content')
    const expected3 = resolve(dir3, 'content')
    t.equal(
      actual3,
      expected3,
      'if contentDirectory is found contentRootPath is contentDirectory'
    )
  })

  t.test('makePermalink', async () => {
    const examples = (prefix) => {
      const pre = prefix === '/' ? '' : prefix
      return [{
        actual: makePermalink({
          prefix,
          parts: ['category name', 'post name.md'],
          addHTMLExtension: true
        }),
        expected: `${pre}/category-name/post-name.html`,
        message: `Categorized post gets proper permalink when prefix is ${prefix}`
      }, {
        actual: makePermalink({
          prefix,
          parts: ['category name', 'post name']
        }),
        expected: `${pre}/category-name/post-name`,
        message: `Categorized foldered post gets proper permalink when prefix is ${prefix}`
      }, {
        actual: makePermalink({
          prefix,
          parts: ['', 'post name.md'],
          addHTMLExtension: true
        }),
        expected: `${pre}/post-name.html`,
        message: `Uncategorized post gets proper permalink when prefix is ${prefix}`
      }, {
        actual: makePermalink({
          prefix,
          parts: ['post name.md'],
          addHTMLExtension: true
        }),
        expected: `${pre}/post-name.html`,
        message: `Uncategorized post 2 gets proper permalink when prefix is ${prefix}`
      }, {
        actual: makePermalink({
          prefix,
          parts: ['post name']
        }),
        expected: `${pre}/post-name`,
        message: `Uncategorized foldered post gets proper permalink when prefix is ${prefix}`
      }, {
        actual: makePermalink({
          prefix,
          parts: ['category name']
        }),
        expected: `${pre}/category-name`,
        message: `Category gets proper permalink when prefix is ${prefix}`
      }, {
        actual: makePermalink({
          prefix,
          parts: ['some page.md'],
          addHTMLExtension: true
        }),
        expected: `${pre}/some-page.html`,
        message: `Subpage gets proper permalink when prefix is ${prefix}`
      }]
    }

    const allExamples = [
      ...examples('/'),
      ...examples('/blog')
    ]

    allExamples.forEach(({ actual, expected, message }) => {
      t.equal(actual, expected, message)
    })
  })

  t.test('maybeRawHTMLType', async () => {
    t.equal(maybeRawHTMLType('.html'), 'raw-html-type', '.html')
    t.equal(maybeRawHTMLType('.HTML'), 'raw-html-type', '.HTML')
    t.equal(maybeRawHTMLType('.hbs'), 'raw-html-type', '.hbs')
    t.equal(maybeRawHTMLType('.handlebars'), 'raw-html-type', '.handlebars')
    t.equal(maybeRawHTMLType('.HANDLEBARS'), 'raw-html-type', '.HANDLEBARS')
    t.equal(maybeRawHTMLType('.HBS'), 'raw-html-type', '.HBS')
    t.equal(maybeRawHTMLType('.xhtml'), null, '.xhtml does not count as raw html type')
    t.equal(maybeRawHTMLType('.htm'), null, '.htm does not count as raw html type')
    t.equal(maybeRawHTMLType('.xml'), null, '.xml does not count as raw html type')
    t.equal(maybeRawHTMLType(), null, 'undefined extension does not mean raw html type')
  })
})
