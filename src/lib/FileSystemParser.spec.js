const { resolve, join, dirname } = require('path')
const { mkdir, writeFile, rmdir } = require('fs/promises')
const { rm } = require('fs/promises')
const { tmpdir } = require('os')
const test = require('tape')
const FileSystemParser = require('../lib/FileSystemParser')

const createMockLogger = () => ({
  debug: () => {}
})

test('FileSystemParser.lookBack', t => {
  const path = join('lorem', 'ipsum', 'dolor', 'sit')

  t.equal(
    FileSystemParser.lookBack(path, 1),
    resolve(join('lorem', 'ipsum', 'dolor')),
    'resolves parent path with depth 1'
  )

  t.equal(
    FileSystemParser.lookBack(path, 2),
    resolve(join('lorem', 'ipsum')),
    'resolves parent path with depth 2'
  )

  t.equal(
    FileSystemParser.lookBack(path, 3),
    resolve('lorem'),
    'resolves parent path with depth 3'
  )

  t.equal(
    FileSystemParser.lookBack(path),
    resolve(join('lorem', 'ipsum', 'dolor')),
    'defaults to depth 1 when depth is undefined'
  )

  t.throws(
    () => FileSystemParser.lookBack(),
    'throws error when path is missing'
  )

  t.end()
})

test('FileSystemParser.isTextFile', t => {
  // Text-based file extensions
  t.ok(
    FileSystemParser.isTextFile('.txt'),
    'recognizes .txt as text file'
  )

  t.ok(
    FileSystemParser.isTextFile('.md'),
    'recognizes .md as text file'
  )

  t.ok(
    FileSystemParser.isTextFile('.markdown'),
    'recognizes .markdown as text file'
  )

  t.ok(
    FileSystemParser.isTextFile('.hbs'),
    'recognizes .hbs as text file'
  )

  t.ok(
    FileSystemParser.isTextFile('.handlebars'),
    'recognizes .handlebars as text file'
  )

  t.ok(
    FileSystemParser.isTextFile('.html'),
    'recognizes .html as text file'
  )

  t.ok(
    FileSystemParser.isTextFile('.htm'),
    'recognizes .htm as text file'
  )

  t.ok(
    FileSystemParser.isTextFile('.json'),
    'recognizes .json as text file'
  )

  t.ok(
    FileSystemParser.isTextFile('.srt'),
    'recognizes .srt as text file'
  )

  // Case-insensitive
  t.ok(
    FileSystemParser.isTextFile('.MD'),
    'case-insensitive: recognizes .MD'
  )

  t.ok(
    FileSystemParser.isTextFile('.TXT'),
    'case-insensitive: recognizes .TXT'
  )

  // Binary files
  t.notOk(
    FileSystemParser.isTextFile('.pdf'),
    'does not recognize .pdf as text file'
  )

  t.notOk(
    FileSystemParser.isTextFile('.jpg'),
    'does not recognize .jpg as text file'
  )

  t.notOk(
    FileSystemParser.isTextFile('.png'),
    'does not recognize .png as text file'
  )

  t.notOk(
    FileSystemParser.isTextFile('.zip'),
    'does not recognize .zip as text file'
  )

  t.notOk(
    FileSystemParser.isTextFile(''),
    'does not recognize empty extension'
  )

  t.end()
})

test('FileSystemParser.contentRoot', t => {
  t.plan(2)

  t.test('returns contentRoot when it exists', async t => {
    t.plan(1)
    const testDir = join(tmpdir(), 'fsp-test-contentRoot-existing')
    const contentDir = 'content'
    const fullPath = join(testDir, contentDir)

    try {
      await mkdir(testDir, { recursive: true })
      await mkdir(fullPath, { recursive: true })

      const result = await FileSystemParser.contentRoot(testDir, contentDir)

      t.equal(
        result,
        join(testDir, contentDir),
        'returns full path when contentDirectory exists'
      )
    } finally {
      await rm(testDir, { recursive: true, force: true })
    }
  })

  t.test('returns rootDirectory when contentRoot does not exist', async t => {
    t.plan(1)
    const testDir = join(tmpdir(), 'fsp-test-contentRoot-missing')

    try {
      await mkdir(testDir, { recursive: true })

      const result = await FileSystemParser.contentRoot(testDir, 'nonexistent')

      t.equal(
        result,
        testDir,
        'returns rootDirectory when contentDirectory does not exist'
      )
    } finally {
      await rm(testDir, { recursive: true, force: true })
    }
  })
})

test('FileSystemParser.contentRoot error handling', t => {
  t.plan(1)

  t.test('throws error when rootDirectory is missing', async t => {
    t.plan(1)

    try {
      await FileSystemParser.contentRoot(null, 'content')
      t.fail('should have thrown an error')
    } catch (error) {
      t.match(
        error.message,
        /rootDirectory is a required parameter/,
        'throws error with descriptive message'
      )
    }
  })
})

test('FileSystemParser instance - shouldIncludePath', t => {
  const parser = new FileSystemParser({
    rootDirectory: join(tmpdir(), 'test'),
    contentDirectory: 'content',
    IGNORE_PATHS_REG_EXP: /node_modules/
  }, createMockLogger())

  t.ok(
    parser.shouldIncludePath('readme.md'),
    'includes regular files'
  )

  t.notOk(
    parser.shouldIncludePath('_draft.md'),
    'excludes paths starting with underscore'
  )

  t.notOk(
    parser.shouldIncludePath('.hidden'),
    'excludes paths starting with dot'
  )

  t.notOk(
    parser.shouldIncludePath('node_modules'),
    'excludes paths matching ignorePattern'
  )

  t.ok(
    parser.shouldIncludePath('normalFolder'),
    'includes normal folder names'
  )

  t.end()
})

test('FileSystemParser instance - parse with directory structure', t => {
  t.plan(1)

  t.test('parses directory structure correctly', async t => {
    t.plan(6)

    const testDir = join(tmpdir(), 'fsp-test-parse')
    const contentDir = join(testDir, 'content')

    try {
      // Create test structure
      await mkdir(contentDir, { recursive: true })
      await mkdir(join(contentDir, 'subfolder'), { recursive: true })

      // Create files in parallel
      await Promise.all([
        writeFile(join(contentDir, 'readme.md'), '# Title\n\nContent here'),
        writeFile(join(contentDir, 'data.json'), '{"key": "value"}'),
        writeFile(join(contentDir, 'binary.bin'), '\x00\x01\x02'),
        writeFile(join(contentDir, 'subfolder', 'nested.txt'), 'Nested content')
      ])

      const parser = new FileSystemParser({
        rootDirectory: testDir,
        contentDirectory: 'content',
        IGNORE_PATHS_REG_EXP: /^$/
      }, createMockLogger())

      const result = await parser.parse()

      t.ok(
        Array.isArray(result),
        'parse returns array'
      )

      // Verify structure contains expected files
      const fileNames = result.map(item => item.name)

      t.ok(
        fileNames.includes('readme.md'),
        'contains markdown file'
      )

      t.ok(
        fileNames.includes('data.json'),
        'contains json file'
      )

      t.ok(
        fileNames.includes('binary.bin'),
        'contains binary file'
      )

      // Check for subdirectory
      const subfolder = result.find(item => item.name === 'subfolder')

      t.ok(
        subfolder,
        'contains subfolder'
      )

      t.ok(
        subfolder.children.some(item => item.name === 'nested.txt'),
        'subfolder contains nested.txt'
      )
    } finally {
      await rm(testDir, { recursive: true, force: true })
    }
  })
})

test('FileSystemParser instance - parse respects filters', t => {
  t.plan(1)

  t.test('excludes hidden and ignored files during parse', async t => {
    t.plan(1)

    const testDir = join(tmpdir(), 'fsp-test-parse-filters')
    const contentDir = join(testDir, 'content')

    try {
      // Create test structure with files to exclude
      await mkdir(contentDir, { recursive: true })
      await Promise.all([
        writeFile(join(contentDir, 'visible.md'), 'Visible content'),
        writeFile(join(contentDir, '_hidden.md'), 'Hidden content'),
        writeFile(join(contentDir, '.dotfile'), 'Dot file')
      ])

      const parser = new FileSystemParser({
        rootDirectory: testDir,
        contentDirectory: 'content',
        IGNORE_PATHS_REG_EXP: /^$/
      }, createMockLogger())

      const result = await parser.parse()
      const fileNames = result.map(item => item.name)

      t.notOk(
        fileNames.some(name => name.startsWith('_') || name.startsWith('.')),
        'excludes hidden and underscore-prefixed files'
      )
    } finally {
      await rm(testDir, { recursive: true, force: true })
    }
  })
})

test('FileSystemParser instance - text file content loading', t => {
  t.plan(1)

  t.test('loads content for text files but not binary files', async t => {
    t.plan(2)

    const testDir = join(tmpdir(), 'fsp-test-text-content')
    const contentDir = join(testDir, 'content')

    try {
      await mkdir(contentDir, { recursive: true })
      const textContent = 'This is markdown content'

      await Promise.all([
        writeFile(join(contentDir, 'article.md'), textContent),
        writeFile(join(contentDir, 'binary.bin'), '\x00\x01\x02\x03')
      ])

      const parser = new FileSystemParser({
        rootDirectory: testDir,
        contentDirectory: 'content',
        IGNORE_PATHS_REG_EXP: /^$/
      }, createMockLogger())

      const result = await parser.parse()

      const mdFile = result.find(item => item.name === 'article.md')
      const binFile = result.find(item => item.name === 'binary.bin')

      t.ok(
        mdFile.content,
        'text file contains content property'
      )

      t.notOk(
        binFile.content,
        'binary file does not contain content property'
      )
    } finally {
      await rm(testDir, { recursive: true, force: true })
    }
  })
})