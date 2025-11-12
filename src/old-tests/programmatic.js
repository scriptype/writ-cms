const { rm, readdir, readFile } = require('fs/promises')
const { join, resolve } = require('path')
const test = require('tape')
const writ = require('..')
const {
  createTempDir,
  common,
  hasPaths,
  hasNotPaths,
  expectPaths
} = require('./utils')
globalThis.fetch = globalThis.fetch || require('node-fetch')

test('builds after a file is deleted', async t => {
  const dir = await createTempDir(t)

  const fileNameIn = 'hello.txt'
  const fileNameOut = 'hello.html'
  await dir.mkFile(fileNameIn, 'Hello!')

  await writ.build({
    rootDirectory: dir.name
  })

  await rm(join(dir.name, fileNameIn))

  await writ.build({
    rootDirectory: dir.name
  })

  await common.builds(t, dir.name, {
    rootDirectoryPaths: {
      notExists: [fileNameIn]
    },
    exportDirectoryPaths: {
      notExists: [fileNameOut]
    }
  })
})

test('empty folder in root is an empty category', async t => {
  const dir = await createTempDir(t)

  const folderName = 'empty folder'
  await dir.mkDir(folderName)

  await writ.build({
    rootDirectory: dir.name
  })

  await common.builds(t, dir.name, {
    rootDirectoryPaths: {
      exists: [folderName]
    },
    exportDirectoryPaths: {
      exists: [writ.helpers.slug(folderName)]
    }
  })
})

test('post files in a category', async t => {
  const dir = await createTempDir(t)

  const categoryName = 'my category'
  const posts = [
    'hbs in short.hbs',
    'handlebars.handlebars',
    'md is not managing director here.md',
    'markdown.markdown',
    'txt.txt',
    'eyç tiğem el.html',
  ]

  await dir.mkDir(categoryName)
  await Promise.all(posts.map(post => {
    return dir.mkFile(join(categoryName, post), '')
  }))

  await writ.build({
    rootDirectory: dir.name
  })

  const { exportDirectory } = writ.getDefaultSettings()

  await common.builds(t, dir.name, {
    rootDirectoryPaths: {
      exists: [categoryName]
    },
    exportDirectoryPaths: {
      exists: [writ.helpers.slug(categoryName)]
    }
  })

  const categoryDir = await readdir(join(dir.name, exportDirectory, writ.helpers.slug(categoryName)))
  const compiledPostNames = posts.map(post => {
    return writ.helpers.slug(post).concat('.html')
  })
  hasPaths(t, categoryDir, compiledPostNames)
})

test('homepage', async t => {
  const { exportDirectory, homepageDirectory } = writ.getDefaultSettings()

  const dir = await createTempDir(t)
  const rawHTMLHomepageContent = 'raw html homepage'
  await dir.mkFile('index.html', rawHTMLHomepageContent)

  await writ.build({
    rootDirectory: dir.name
  })

  await common.builds(t, dir.name, {
    rootDirectoryPaths: {
      exists: ['index.html']
    },
    exportDirectoryPaths: {
      exists: ['index.html']
    }
  })

  const actualRawHTMLOutputContent = await readFile(join(dir.name, exportDirectory, 'index.html'), { encoding: 'utf-8' })
  const expectedRawHTMLOutputContent = new RegExp(`^${rawHTMLHomepageContent}$`, 's')
  t.match(
    actualRawHTMLOutputContent,
    expectedRawHTMLOutputContent,
    "When homepage file has .html extension, it's treated as raw HTML"
  )

  await rm(join(dir.name, 'index.html'))

  const folderedHomepageContent = 'I am foldered homepage'
  await dir.mkDir(homepageDirectory)
  await dir.mkFile(join(homepageDirectory, 'index.html'), folderedHomepageContent)

  await writ.build({
    rootDirectory: dir.name
  })

  await common.builds(t, dir.name, {
    rootDirectoryPaths: {
      exists: [homepageDirectory]
    },
    exportDirectoryPaths: {
      notExists: [homepageDirectory],
      exists: ['index.html']
    }
  })

  const actualFolderedOutputContent = await readFile(join(dir.name, exportDirectory, 'index.html'), { encoding: 'utf-8' })
  const expectedFolderedOutputContent = new RegExp(`^${folderedHomepageContent}$`, 's')
  t.match(
    actualFolderedOutputContent,
    expectedFolderedOutputContent,
    'Using a homepage folder works'
  )
})

test('subpages', async t => {
  const dir = await createTempDir(t)

  const subpages = [
    'test subpage.hbs',
    'another subpage.handlebars',
    'this is a sub page.md',
    'markdown page.markdown',
    'txt page.txt',
    'boş page.html',
  ]

  const { exportDirectory, pagesDirectory } = writ.getDefaultSettings()
  const { slug } = writ.helpers

  await dir.mkDir(pagesDirectory)
  await Promise.all(subpages.map(subpage => {
    return dir.mkFile(join(pagesDirectory, subpage), '')
  }))

  const folderedSubpage = {
    folderName: 'foldered subpage',
    pageFileName: 'page.md',
    localAssets: [
      'hey.txt',
      'demo.html',
      'a photo.jpg'
    ]
  }
  const folderPath = join(pagesDirectory, folderedSubpage.folderName)
  await dir.mkDir(folderPath)
  await dir.mkFile(join(folderPath, folderedSubpage.pageFileName), '')
  await Promise.all(folderedSubpage.localAssets.map(localAsset => {
    return dir.mkFile(join(folderPath, localAsset), '')
  }))

  await writ.build({
    rootDirectory: dir.name
  })

  await common.builds(t, dir.name, {
    rootDirectoryPaths: {
      exists: [pagesDirectory]
    },
    exportDirectoryPaths: {
      exists: [
        ...subpages.map(s => slug(s) + '.html'),
        slug(folderedSubpage.folderName)
      ]
    }
  })

  const exportFolderDir = await readdir(join(dir.name, exportDirectory, slug(folderedSubpage.folderName)))
  expectPaths(t, exportFolderDir, {
    exists: [
      'index.html',
      ...folderedSubpage.localAssets
    ]
  }, 'Foldered subpage directory')
})

test('builds after theme folder is deleted', async t => {
  const dir = await createTempDir(t)

  await writ.build({
    rootDirectory: dir.name
  })

  const { themeDirectory } = writ.getDefaultSettings()
  await rm(join(dir.name, themeDirectory), { recursive: true })

  await writ.build({
    rootDirectory: dir.name
  })

  await common.builds(t, dir.name)
})

test('builds after theme/assets folder is deleted', async t => {
  const dir = await createTempDir(t)

  await writ.build({
    rootDirectory: dir.name
  })

  const { themeDirectory, assetsDirectory } = writ.getDefaultSettings()
  await rm(join(dir.name, themeDirectory, assetsDirectory), { recursive: true })

  await writ.build({
    rootDirectory: dir.name
  })

  await common.builds(t, dir.name, {
    assetsDirectoryPaths: {
      exists: ['custom'],
      notExists: ['default']
    },
    themeDirectoryPaths: {
      exists: ['templates', 'style.css', 'script.js'],
      notExists: [assetsDirectory]
    }
  })
})

test('builds after theme/templates folder is deleted', async t => {
  const dir = await createTempDir(t)

  await writ.build({
    rootDirectory: dir.name
  })

  const { themeDirectory } = writ.getDefaultSettings()
  await rm(join(dir.name, themeDirectory, 'templates'), { recursive: true })

  await writ.build({
    rootDirectory: dir.name
  })

  await common.builds(t, dir.name, {
    themeDirectoryPaths: {
      exists: ['assets', 'style.css', 'script.js'],
      notExists: ['templates']
    }
  })
})



test('renders mentions correctly', async t => {
  const dir = await createTempDir(t)

  const mentioned = {
    title: 'hello',
    nameIn: 'post.md',
    nameOut: 'index.html',
    lorem: 'ipsum',
    cover: 'hey.jpg',
    get content() {
      return `---
lorem: ${this.lorem}
cover: ${this.cover}
---
Hello`
    }
  }

  const mentioner = {
    title: 'world',
    nameIn: 'world.txt',
    nameOut: 'world.html',
    content: `
    {{mention "/hello"}} world.

    {{#mention "/hello"}}
      {{lorem}}
    {{/mention}}

    {{#mention "/hello"}}
      <img src="{{cover}}">
    {{/mention}}
    `
  }

  await dir.mkDir(mentioned.title)
  await dir.mkFile(join(mentioned.title, mentioned.nameIn), mentioned.content)
  await dir.mkFile(mentioner.nameIn, mentioner.content)

  await writ.build({
    rootDirectory: dir.name
  })

  const { exportDirectory } = writ.getDefaultSettings()

  const mentionerHTML = await readFile(join(dir.name, exportDirectory, mentioner.nameOut), { encoding: 'utf-8' })
  const expectedPattern1FromMentioner = new RegExp(`href=(?:"|')\/${mentioned.title}(?:"|')`)
  const expectedPattern2FromMentioner = new RegExp(mentioned.lorem)
  const expectedPattern3FromMentioner = new RegExp(`${mentioned.title}/${mentioned.cover}`)
  t.match(
    mentionerHTML,
    expectedPattern1FromMentioner,
    'Mentioner post has a link to the mentioned post in its content'
  )
  t.match(
    mentionerHTML,
    expectedPattern2FromMentioner,
    'Mentioner post retrieves any metadata of mentioned post using mention block helper'
  )
  t.match(
    mentionerHTML,
    expectedPattern3FromMentioner,
    'Mentioner post retreives cover image of the mentioned post with an absolute url'
  )

  const mentionedHTML = await readFile(join(dir.name, exportDirectory, mentioned.title, mentioned.nameOut), { encoding: 'utf-8' })
  const expectedPattern1FromMentioned = new RegExp(`href=(?:"|')\/${mentioner.nameOut}(?:"|')`)
  const expectedPattern2FromMentioned = new RegExp(mentioner.title)
  t.match(
    mentionerHTML,
    expectedPattern1FromMentioner,
    'Mentioned post has a link to the mentioner post in its content'
  )
  t.match(
    mentionerHTML,
    expectedPattern1FromMentioner,
    'Mentioned post content includes the mentioner post\'s title'
  )
})

test('allows uncategorized foldered post', async t => {
  const dir = await createTempDir(t)

  const postName = 'test-post'
  const localAssetName = 'asset.jpg'
  const subFolderName = 'some folder'
  const subFolderAsset = 'note.txt'
  await dir.mkDir(postName)
  await dir.mkFile(join(postName, 'post.md'), 'a post')
  await dir.mkFile(join(postName, localAssetName), '')
  await dir.mkDir(join(postName, subFolderName))
  await dir.mkFile(join(postName, subFolderName, subFolderAsset), 'an asset inside subfolder')

  await writ.build({
    rootDirectory: dir.name
  })

  await common.builds(t, dir.name, {
    exportDirectoryPaths: {
      exists: [postName]
    }
  })

  const { exportDirectory } = writ.getDefaultSettings()
  const compiledPostFolder = await readdir(join(dir.name, exportDirectory, postName))
  hasPaths(t, compiledPostFolder, ['index.html', localAssetName, subFolderName], 'Compiled root post folder has index.html and local assets')

  const subFolder = await readdir(join(dir.name, exportDirectory, postName, subFolderName))
  hasPaths(t, subFolder, [subFolderAsset], 'Subfolder inside foldered post is passed-through')
})

test('builds when contentDirectory exists', async t => {
  const dir = await createTempDir(t)

  const { contentDirectory } = writ.getDefaultSettings()
  await dir.mkDir(contentDirectory)

  const uncategorizedPostFile = 'uncategorized-post-name.txt'
  const uncategorizedPostFileOut = 'uncategorized-post-name.html'
  await dir.mkFile(join(contentDirectory, uncategorizedPostFile), 'Hello!')

  const uncategorizedFolderedPost = 'a new post'
  const uncategorizedFolderedPostOut = 'a-new-post'
  await dir.mkDir(join(contentDirectory, uncategorizedFolderedPost))
  await dir.mkFile(join(contentDirectory, uncategorizedFolderedPost, 'post.md'), 'A new post')

  const rootAsset = 'asset-in-root.jpg'
  await dir.mkFile(rootAsset, '')

  const rootAssetInContent = 'asset-in-content-folder.jpg'
  await dir.mkFile(join(contentDirectory, rootAssetInContent), '')

  const categoryName = 'test category'
  const categoryNameOut = 'test-category'
  const categorizedPostName = 'test post'
  const categorizedPostNameOut = 'test-post'
  const categorizedPostLocalAsset = 'post local asset.jpg'
  await dir.mkDir(join(contentDirectory, categoryName, categorizedPostName))
  await Promise.all([
    dir.mkFile(join(contentDirectory, categoryName, categorizedPostName, 'post.md'), 'My test post'),
    dir.mkFile(join(contentDirectory, categoryName, categorizedPostName, categorizedPostLocalAsset), ''),
  ])

  await writ.build({
    rootDirectory: dir.name
  })

  const { exportDirectory } = writ.getDefaultSettings()

  const exportDir = await readdir(join(dir.name, exportDirectory))

  await common.builds(t, dir.name, {
    rootDirectoryPaths: {
      exists: [contentDirectory, rootAsset]
    },
    exportDirectoryPaths: {
      notExists: [contentDirectory, rootAsset],
      exists: [uncategorizedPostFileOut, uncategorizedFolderedPostOut, rootAssetInContent]
    }
  })

  const categorizedPostFolder = await readdir(join(dir.name, exportDirectory, categoryNameOut, categorizedPostNameOut))
  hasPaths(t, categorizedPostFolder, ['index.html', categorizedPostLocalAsset], 'Compiled test post folder has index.html and local asset')

  const uncategorizedFolderedPostFolder = await readdir(join(dir.name, exportDirectory, uncategorizedFolderedPostOut))
  hasPaths(t, uncategorizedFolderedPostFolder, ['index.html'], 'Compiled uncategorized foldered post folder has index.html')
})

test('passes through assets folder', async t => {
  const dir = await createTempDir(t)

  const { assetsDirectory } = writ.getDefaultSettings()
  await dir.mkDir(assetsDirectory)
  const fileName = 'hey-asset.jpg'
  await dir.mkAsset(assetsDirectory, fileName, '')

  await writ.build({
    rootDirectory: dir.name
  })

  await common.builds(t, dir.name, {
    assetsDirectoryPaths: {
      exists: [fileName]
    }
  })
})

test('refreshTheme option when there is theme/keep', async t => {
  const dir = await createTempDir(t)

  await writ.build({
    rootDirectory: dir.name
  })

  const { themeDirectory } = writ.getDefaultSettings()

  const deletedFileName = 'deleted.css'
  await dir.mkFile(join(themeDirectory, deletedFileName), '')
  const keptFileName = 'kept.css'
  await dir.mkDir(join(themeDirectory, 'keep'))
  await dir.mkFile(join(themeDirectory, 'keep', keptFileName), '')

  await writ.build({
    rootDirectory: dir.name,
    refreshTheme: true
  })

  await common.builds(t, dir.name, {
    themeDirectoryPaths: {
      exists: ['keep'],
      notExists: [deletedFileName]
    }
  })

  const themeDirectoryContents = await readdir(join(dir.name, themeDirectory))
  hasNotPaths(t, themeDirectoryContents, [deletedFileName], 'theme directory is refreshed')

  const keepDirectoryContents = await readdir(join(dir.name, themeDirectory, 'keep'))
  hasPaths(t, keepDirectoryContents, [keptFileName], 'theme/keep/file is preserved')
})

test('refreshTheme option when there is no theme/keep', async t => {
  const dir = await createTempDir(t)

  await writ.build({
    rootDirectory: dir.name
  })

  const { themeDirectory } = writ.getDefaultSettings()

  const deletedFileName = 'deleted.css'
  await dir.mkFile(join(themeDirectory, deletedFileName), '')

  await writ.build({
    rootDirectory: dir.name,
    refreshTheme: true
  })

  await common.builds(t, dir.name, {
    themeDirectoryPaths: {
      notExists: [deletedFileName]
    }
  })

  const themeDirectoryContents = await readdir(join(dir.name, themeDirectory))
  hasNotPaths(t, themeDirectoryContents, [deletedFileName], 'theme directory is refreshed')
})

test('hooks', async t => {
  const dir = await createTempDir(t)
  const assetsDir = await createTempDir(t)
  const partialsDir = await createTempDir(t)

  const testAssetName = 'test-asset.jpg'
  const testAuthorNames = ['random', 'human', 'names']
  await assetsDir.mkFile(testAssetName, '')
  await partialsDir.mkFile('hello.hbs', 'world')

  writ
    .useAssets((value) => {
      return [
        ...value,
        {
          src: assetsDir.name,
          dest: 'test'
        }
      ]
    })
    .useContentModel((value) => {
      return {
        ...value,
        authors: testAuthorNames
      }
    })
    .useTemplatePartials((value) => {
      return [
        ...value,
        partialsDir.name
      ]
    })
    .useTemplateHelpers((value) => {
      return {
        ...value,
        andInBetween(arr) {
          return arr.join(' and ')
        }
      }
    })
    .useTemplate((value) => {
      return `${value} <p>{{>hello}} authors: {{andInBetween authors}}</p>`
    })

  await writ.build({
    rootDirectory: dir.name
  })

  const { exportDirectory, assetsDirectory } = writ.getDefaultSettings()

  const indexHTMLPath = join(dir.name, exportDirectory, 'index.html')
  const indexHTMLContent = await readFile(indexHTMLPath, { encoding: 'utf-8' })

  const testAssetsPath = join(dir.name, exportDirectory, assetsDirectory, 'test')
  const testAssetsDir = await readdir(testAssetsPath)

  t.true(
    testAssetsDir.includes(testAssetName),
    'useAssets hook'
  )
})

test('start mode', t => {

  t.test('starts a local server for preview', async st => {
    const dir = await createTempDir()

    const previewPort = 5005

    await dir.mkFile('settings.json', JSON.stringify({
      previewPort
    }))

    const { exportDirectory } = writ.getDefaultSettings()

    const watcher = await writ.start({
      rootDirectory: dir.name,
      startCMSServer: false
    })

    const response = await fetch(`http://localhost:${previewPort}`)
    const textResponse = await response.text()
    const filePath = join(dir.name, exportDirectory, 'index.html')
    const indexHTMLContent = await readFile(filePath, {
      encoding: 'utf-8'
    })

    st.true(
      textResponse === indexHTMLContent,
      `index.html is broadcast over localhost:${previewPort}`
    )

    st.teardown(() => {
      watcher.stop()
      dir.rm()
    })
  })

  t.test('changes trigger a re-build', async st => {
    const dir = await createTempDir()

    const previewPort = 5005

    await dir.mkFile('settings.json', JSON.stringify({
      previewPort
    }))

    const watcher = await writ.start({
      rootDirectory: dir.name,
      startCMSServer: false
    })

    const { exportDirectory } = writ.getDefaultSettings()

    const response1 = await fetch(`http://localhost:${previewPort}`)
    const textResponse1 = await response1.text()

    const change = 'totally random text'
    st.false(textResponse1.includes(change), 'Initially there is no change')

    await dir.mkFile('a new file.md', change)
    await new Promise(r => setTimeout(r, 600))

    const response2 = await fetch(`http://localhost:${previewPort}`)
    const textResponse2 = await response2.text()

    st.true(textResponse2.includes(change), 'The change is reflected in the page')

    st.teardown(() => {
      watcher.stop()
      dir.rm()
    })
  })

})
