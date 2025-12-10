const test = require('tape')
const matcha = require('./matcha')

const FIXTURE_FS = {
  homepage: {
    name: 'homepage',
    children: [
      { name: 'home.md', extension: '.md', content: '' }
    ]
  },
  homepage2: {
    name: 'homepage',
    children: [
      { name: 'house.md', extension: '.md', content: '' }
    ]
  },
  category: {
    name: 'blog',
    children: [
      { name: 'index.md', extension: '.md', content: '' },
      { name: 'post1.md', extension: '.md', content: '' },
      { name: 'config.json', extension: '.json', content: '{}' },
      {
        name: 'subdir',
        children: [
          { name: 'index2.md', extension: '.md', content: '' }
        ]
      }
    ]
  },
  templateFile: {
    name: 'lorem.md',
    extension: '.md',
    content: ''
  },
  templateFile2: {
    name: 'ipsum.md',
    extension: '.md',
    content: ''
  },
  dataFile: {
    name: 'machinery.json',
    extension: '.json',
    content: '{}'
  },
  directoryNoIndex: {
    name: 'noindex',
    children: [
      { name: 'post1.md', extension: '.md', content: '' },
      { name: 'config.json', extension: '.json', content: '{}' }
    ]
  },
  jpegFile: {
    name: 'image.jpeg',
    extension: '.jpeg',
    content: ''
  }
}

test('matcha', t => {
  t.test('true', t => {
    const matcher = matcha.true()

    t.ok(
      matcher(FIXTURE_FS.templateFile),
      'always returns true'
    )

    t.end()
  })

  t.test('false', t => {
    const matcher = matcha.false()

    t.notOk(
      matcher(FIXTURE_FS.templateFile),
      'always returns false'
    )

    t.end()
  })

  t.test('either', t => {
    t.test('matches single node when at least one matcher matches', t => {
      const matcher = matcha.either(
        matcha.templateFile({
          nameOptions: ['nonexistent']
        }),
        matcha.dataFile({
          nameOptions: ['machinery']
        })
      )

      t.ok(
        matcher(FIXTURE_FS.dataFile),
        'matches when second matcher applies'
      )

      t.end()
    })

    t.test('does not match single node when no matchers apply', t => {
      const matcher = matcha.either(
        matcha.templateFile({
          nameOptions: ['nonexistent']
        }),
        matcha.dataFile({
          nameOptions: ['other']
        })
      )

      t.notOk(
        matcher(FIXTURE_FS.dataFile),
        'does not match when no matchers apply'
      )

      t.end()
    })

    t.test('works as children matcher in directory', t => {
      const matcher = matcha.directory({
        nameOptions: ['blog'],
        children: matcha.either(
          matcha.templateFile({
            nameOptions: ['nonexistent']
          }),
          matcha.dataFile({
            nameOptions: ['config']
          })
        )
      })

      t.ok(
        matcher(FIXTURE_FS.category),
        'matches when one of the either matchers matches a child'
      )

      t.end()
    })

    t.test('does not match directory children when none of either matchers match', t => {
      const matcher = matcha.directory({
        nameOptions: ['blog'],
        children: matcha.either(
          matcha.templateFile({
            nameOptions: ['nonexistent']
          }),
          matcha.dataFile({
            nameOptions: ['other']
          })
        )
      })

      t.notOk(
        matcher(FIXTURE_FS.category),
        'does not match when no either matchers match a child'
      )

      t.end()
    })

    t.end()
  })

  t.test('and', t => {
    t.test('matches single node when all matchers match', t => {
      const matcher = matcha.and(
        matcha.directory({
          nameOptions: ['blog']
        }),
        matcha.directory({
          children: [
            matcha.dataFile({
              nameOptions: ['config']
            })
          ]
        })
      )

      t.ok(
        matcher(FIXTURE_FS.category),
        'matches when all matchers apply'
      )

      t.end()
    })

    t.test('does not match single node when not all matchers match', t => {
      const matcher = matcha.and(
        matcha.dataFile({
          nameOptions: ['data']
        }),
        matcha.templateFile({
          nameOptions: ['index']
        })
      )

      t.notOk(
        matcher(FIXTURE_FS.dataFile),
        'does not match when not all matchers apply'
      )

      t.end()
    })

    t.test('works as children matcher in directory', t => {
      const matcher = matcha.directory({
        nameOptions: ['blog'],
        children: matcha.and(
          matcha.templateFile({
            nameOptions: ['index']
          }),
          matcha.dataFile({
            nameOptions: ['config']
          })
        )
      })

      t.ok(
        matcher(FIXTURE_FS.category),
        'matches when all and matchers match children'
      )

      t.end()
    })

    t.test('does not match when not all matchers match', t => {
      const matcher = matcha.directory({
        nameOptions: ['blog'],
        children: matcha.and(
          matcha.templateFile({
            nameOptions: ['nonexistent']
          }),
          matcha.dataFile({
            nameOptions: ['config']
          })
        )
      })

      t.notOk(
        matcher(FIXTURE_FS.category),
        'does not match when not all and matchers match'
      )

      t.end()
    })

    t.end()
  })

  t.test('directory', t => {
    t.test('matches directory with specified name', t => {
      const matcher = matcha.directory({
        nameOptions: ['homepage']
      })

      t.ok(
        matcher(FIXTURE_FS.homepage),
        'matches directory with correct name'
      )

      t.notOk(
        matcher(FIXTURE_FS.category),
        'rejects directory with different name'
      )

      t.notOk(
        matcher(FIXTURE_FS.templateFile),
        'rejects non-directory'
      )

      t.end()
    })

    t.test('matches any directory when nameOptions absent', t => {
      const matcher = matcha.directory({})

      t.ok(
        matcher(FIXTURE_FS.homepage),
        'matches directory'
      )

      t.ok(
        matcher(FIXTURE_FS.category),
        'matches another directory'
      )

      t.notOk(
        matcher(FIXTURE_FS.templateFile),
        'rejects file'
      )

      t.end()
    })

    t.test('validates children via matcher functions', t => {
      const matcher = matcha.directory({
        nameOptions: ['blog'],
        children: [
          matcha.templateFile({
            nameOptions: ['index']
          })
        ]
      })

      t.ok(
        matcher(FIXTURE_FS.category),
        'matches when child satisfies matcher'
      )

      t.end()
    })

    t.test('supports recursive child search', t => {
      const matcher = matcha.directory({
        childSearchDepth: 1,
        children: [
          matcha.templateFile({
            nameOptions: ['index2']
          })
        ]
      })

      t.ok(
        matcher(FIXTURE_FS.category),
        'finds child at nested depth'
      )

      t.end()
    })

    t.test('does not match nested child without childSearchDepth', t => {
      const matcher = matcha.directory({
        children: [
          matcha.templateFile({
            nameOptions: ['index2']
          })
        ]
      })

      t.notOk(
        matcher(FIXTURE_FS.category),
        'does not find file nested in subdirectory without recursive search'
      )

      t.end()
    })

    t.end()
  })

  t.test('dataFile', t => {
    t.test('matches data file with name', t => {
      const matcher = matcha.dataFile({
        nameOptions: ['machinery']
      })

      t.ok(
        matcher(FIXTURE_FS.dataFile),
        'matches data file with matching name'
      )

      t.end()
    })

    t.test('does not match template file', t => {
      const matcher = matcha.dataFile({
        nameOptions: ['config']
      })

      t.notOk(
        matcher(FIXTURE_FS.templateFile),
        'does not match template file'
      )

      t.end()
    })

    t.test('does not match non-data file type', t => {
      const matcher = matcha.dataFile({
        nameOptions: ['image']
      })

      t.notOk(
        matcher(FIXTURE_FS.jpegFile),
        'does not match jpeg file'
      )

      t.end()
    })

    t.end()
  })

  t.test('templateFile', t => {
    t.test('matches template file with name', t => {
      const matcher = matcha.templateFile({
        nameOptions: ['lorem']
      })

      t.ok(
        matcher(FIXTURE_FS.templateFile),
        'matches template file with matching name'
      )

      t.end()
    })

    t.test('does not match data file', t => {
      const matcher = matcha.templateFile({
        nameOptions: ['data']
      })

      t.notOk(
        matcher(FIXTURE_FS.dataFile),
        'does not match data file'
      )

      t.end()
    })

    t.test('does not match non-template file type', t => {
      const matcher = matcha.templateFile({
        nameOptions: ['image']
      })

      t.notOk(
        matcher(FIXTURE_FS.jpegFile),
        'does not match jpeg file'
      )

      t.end()
    })

    t.end()
  })

  t.test('folderable', t => {
    t.test('matches any template file', t => {
      const matcher = matcha.folderable()

      t.ok(
        matcher(FIXTURE_FS.templateFile),
        'matches template file'
      )

      t.end()
    })

    t.test('matches standalone template file with name constraint', t => {
      const matcher = matcha.folderable({
        nameOptions: {
          standalone: ['lorem']
        }
      })

      t.ok(
        matcher(FIXTURE_FS.templateFile),
        'matches standalone file with matching name'
      )

      t.end()
    })

    t.test('does not match standalone file with non-matching name', t => {
      const matcher = matcha.folderable({
        nameOptions: {
          standalone: ['other']
        }
      })

      t.notOk(
        matcher(FIXTURE_FS.templateFile),
        'does not match standalone file without matching name'
      )

      t.end()
    })

    t.test('matches directory with index file', t => {
      const matcher = matcha.folderable({
        nameOptions: {
          index: ['home']
        }
      })

      t.ok(
        matcher(FIXTURE_FS.homepage),
        'matches directory containing index file'
      )

      t.end()
    })

    t.test('does not match directory without index child', t => {
      const matcher = matcha.folderable({
        nameOptions: {
          index: ['index']
        }
      })

      t.notOk(
        matcher(FIXTURE_FS.directoryNoIndex),
        'does not match directory without index file'
      )

      t.end()
    })

    t.test('does not match non-template files', t => {
      const matcher = matcha.folderable()

      t.notOk(
        matcher(FIXTURE_FS.jpegFile),
        'does not match jpeg file'
      )

      t.end()
    })

    t.test('matches with all nameOptions: standalone, index, and folder', t => {
      const matcher = matcha.folderable({
        nameOptions: {
          standalone: ['lorem'],
          index: ['home'],
          folder: ['homepage']
        }
      })

      t.ok(
        matcher(FIXTURE_FS.templateFile),
        'matches standalone file with correct name'
      )

      t.notOk(
        matcher(FIXTURE_FS.templateFile2),
        'does not match standalone file with different name'
      )

      t.ok(
        matcher(FIXTURE_FS.homepage),
        'matches directory with correct name and index file'
      )

      t.notOk(
        matcher(FIXTURE_FS.homepage2),
        'does not match directory with different index file'
      )

      t.notOk(
        matcher(FIXTURE_FS.category),
        'does not match directory with different name'
      )

      t.end()
    })

    t.end()
  })
})
