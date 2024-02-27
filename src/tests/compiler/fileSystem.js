const { resolve, join } = require('path')
const test = require('tape')
const { lookBack } = require('../../compiler/fileSystem')

test('compiler/fileSystem', t => {
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
