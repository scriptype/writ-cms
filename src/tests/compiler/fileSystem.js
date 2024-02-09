const { tmpdir } = require('os')
const { rm, mkdtemp, mkdir, readdir, readFile, writeFile } = require('fs/promises')
const { resolve, join } = require('path')
const test = require('tape')
const { contentRoot, lookBack } = require('../../compiler/fileSystem')

const tempDir = () => {
  return mkdtemp(join(tmpdir(), 'writ-test-'))
}

test('compiler/fileSystem', t => {
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
      'if contentDirectory parameter is missing, contentRoot is rootDirectory'
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
      'if contentDirectory is not found, contentRoot is rootDirectory'
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
      'if contentDirectory is found contentRoot is contentDirectory'
    )
  })

  t.test('lookBack', async () => {
    const path = join('lorem', 'ipsum', 'dolor', 'sit')
    t.equal(
      lookBack(path, 1),
      resolve(join('lorem', 'ipsum', 'dolor')),
      'resolves parent path at given traverse distance'
    )

    t.equal(
      lookBack(path, 2),
      resolve(join('lorem', 'ipsum')),
      'resolves parent path at given traverse distance'
    )

    t.equal(
      lookBack(path, 3),
      resolve('lorem'),
      'resolves parent path at given traverse distance'
    )

    t.equal(
      lookBack(path),
      resolve(join('lorem', 'ipsum', 'dolor')),
      'if depth parameter is missing, looks back just one level'
    )

    t.throws(lookBack, 'if path parameter is missing, throws exception')
  })
})