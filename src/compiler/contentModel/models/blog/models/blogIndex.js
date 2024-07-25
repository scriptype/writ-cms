const _ = require('lodash')
const Settings = require('../../../../../settings')
const { maybeRawHTMLType } = require('../../../../../helpers')
const contentTypes = require('../contentTypes')
const parseTemplate = require('../parseTemplate')
const { isLocalAsset } = require('../../root/models/localAsset')

const DEFAULT_TYPE = 'basic'

const isBlogIndexFile = (fsObject) => {
  return fsObject.type === contentTypes.BLOG_INDEX
}

/*
 * blogIndex is the landing page of /blog
 *
 * This serves both as the blog manifest file and the landing page of blog.
 *
 * TODO: Use prefix in calculating permalink.
 * TODO: Implement an 'outputPrefix' metadata that would override the prefix.
 * TODO: Implement a rendering target for blogIndex (think how to re-organize rendering in relation to content models.
 * */
const createBlogIndex = (fsObject, { prefix }) => {
  const permalink = Settings.getSettings().permalinkPrefix

  const metadata = parseTemplate(fsObject)

  // This is a setting for blog manifest
  const outputPrefix = metadata.outputPrefix || prefix

  return {
    ..._.omit(fsObject, 'children'),
    type: contentTypes.BLOG_INDEX,
    data: {
      type: metadata.type || maybeRawHTMLType(fsObject.extension) || DEFAULT_TYPE,
      title: metadata.title || '',
      content: metadata.content || '',
      mentions: metadata.mentions || [],
      ...metadata.attributes,
      permalink,
      outputPrefix
    }
  }
}

module.exports = {
  isBlogIndexFile,
  createBlogIndex
}
