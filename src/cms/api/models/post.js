const { writeFile, mkdir } = require('fs/promises')
const { join } = require('path')
const frontMatter = require('front-matter')
const { contentRootPath, omitResolvedLinks, buildFrontMatter } = require('../helpers')

const createPostModel = ({ getSettings, getContentModel }) => {
  const createPost = async ({
    taxonomyPath,
    title,
    content,
    extension,
    metadata
  }) => {
    const opts = {
      taxonomyPath: taxonomyPath || [],
      title: title || 'Untitled',
      content: content || '',
      extension: extension || 'md',
      metadata: metadata || {}
    }
    const { rootDirectory, contentDirectory } = getSettings()
    const root = await contentRootPath(rootDirectory, contentDirectory)
    const path = join(...[root].concat(opts.taxonomyPath.concat(opts.title)))
    const frontMatter = buildFrontMatter(opts.metadata)
    const fileContent = [frontMatter, opts.content].join('\n').trim()
    try {
      await mkdir(path, { recursive: true })
    } catch {}
    return writeFile(`${join(path, 'post')}.${opts.extension}`, fileContent)
  }

  return {
    create: createPost
  }
}

module.exports = createPostModel
