const { writeFile, mkdir, readdir } = require('fs/promises')
const { join } = require('path')
const express = require('express')
const Settings = require('../../settings')
const { getSlug } = require('../../helpers')

const buildFrontMatter = (metadata) => {
  if (!metadata) {
    return ''
  }
  const keyValues = Object.keys(metadata)
    .map(key => {
      const actualValue = metadata[key]
      const value = Array.isArray(actualValue) ?
        actualValue.join(', ') :
        actualValue
      return `${key}: ${value}`
    })
    .join('\n')
  return ['---', keyValues, '---'].join('\n')
}

const createPost = async ({
  title,
  content,
  extension,
  category,
  metadata,
  localAssets
}) => {
  const { rootDirectory, contentDirectory } = Settings.getSettings()
  const path = join(
    rootDirectory,
    await readdir(join(rootDirectory, contentDirectory)) ? contentDirectory : '',
    category || '',
    title
  )
  const frontMatter = buildFrontMatter(metadata)
  const fileContent = [frontMatter, content].join('\n')
  if (localAssets.length) {
    await mkdir(path, { recursive: true })
    return writeFile(join(path, `post.${extension}`), fileContent)
  }
  return writeFile(`${path}.${extension}`, fileContent)
}

const api = express.Router()

api.put('/posts', async (req, res, next) => {
  try {
    console.log('req.body', req.body)
    await createPost(req.body)
    res.sendStatus(200)
  } catch (e) {
    console.log('something happened', e)
    res.status(500).send(e)
  }
})

module.exports = api
