const { rm, mkdtemp, mkdir, readdir, readFile, writeFile } = require('fs/promises')
const { tmpdir } = require('os')
const { join } = require('path')
const test = require('tape')
const writ = require('..')
const { createTempDir, common } = require('./utils')

const createBlog = async (t) => {
  const dir = await createTempDir(t)

  const { pagesDirectory } = writ.getDefaultSettings()

  await dir.mkFile('settings.json', JSON.stringify({
    permalinkPrefix: '/blog'
  }, null, 2))

  const post1 = {
    name: 'test post.md',
    content: 'this is a test post'
  }
  await dir.mkFile(post1.name, post1.content)

  const categoryName = 'test category'
  const post2 = {
    name: 'post in category.md',
    content: 'this is a post in a category'
  }
  await dir.mkDir(categoryName)
  await dir.mkFile(join(categoryName, post2.name), post2.content)

  const subpage = {
    name: 'example page.md',
    content: 'subpage it is'
  }
  await dir.mkDir(pagesDirectory)
  await dir.mkFile(join(pagesDirectory, subpage.name), subpage.content)

  return {
    dir,
    category1: {
      name: categoryName
    },
    post1,
    subpage
  }
}

test('properly builds to be served at /blog in build mode', async t => {
  const {
    dir,
    category1,
    post1,
    subpage
  } = await createBlog(t)

  const { slug } = writ.helpers
  const { exportDirectory } = writ.getDefaultSettings()

  await writ.build({
    rootDirectory: dir.name
  })

  await common.builds(t, dir.name, {
    exportDirectoryPaths: {
      exists: [
        slug(subpage.name) + '.html',
        slug(category1.name)
      ],
      notExists: ['blog']
    }
  })

  const indexFilePath = join(dir.name, exportDirectory, 'index.html')
  const indexHTMLContent = await readFile(indexFilePath, {
    encoding: 'utf-8'
  })

  const expectedPattern = /href=(?:"|')\/blog\/test-category\/post-in-category.html(?:"|')/
  t.match(
    indexHTMLContent,
    expectedPattern,
    'post permalinks are pointing to /blog/whatever'
  )

  const unexpectedPattern = /href=(?:"|')\/test-category\/post-in-category.html(?:"|')/
  t.doesNotMatch(
    indexHTMLContent,
    unexpectedPattern,
    'post permalinks are really pointing to /blog/whatever'
  )
})

test('properly builds to be served at /blog in start mode', async t => {
  const {
    dir,
    category1,
    post1,
    subpage
  } = await createBlog()

  const { slug } = writ.helpers
  const { exportDirectory } = writ.getDefaultSettings()

  const watcher = await writ.start({
    rootDirectory: dir.name,
    startCMSServer: false
  })

  await common.builds(t, dir.name, {
    exportDirectoryPaths: {
      exists: [
        slug(subpage.name) + '.html',
        slug(category1.name)
      ],
      notExists: ['blog']
    }
  })

  const indexFilePath = join(dir.name, exportDirectory, 'index.html')
  const indexHTMLContent = await readFile(indexFilePath, {
    encoding: 'utf-8'
  })

  const expectedPattern = /href=(?:"|')\/test-category\/post-in-category.html(?:"|')/
  t.match(
    indexHTMLContent,
    expectedPattern,
    'post permalinks are ignoring permalinkPrefix in start mode'
  )

  t.teardown(() => {
    watcher.stop()
    dir.rm()
  })
})
