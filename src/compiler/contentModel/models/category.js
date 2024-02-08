const { join } = require('path')
const _ = require('lodash')
const Settings = require('../../../settings')
const { getSlug } = require('../../../helpers')
const contentTypes = require('../contentTypes')
const { isPost } = require('./post')
const { isLocalAsset } = require('./localAsset')

const createCategory = (fsObject) => {
  const { permalinkPrefix } = Settings.getSettings()
  const slug = getSlug(fsObject.name)
  const data = {
    name: fsObject.name,
    slug,
    permalink: join(permalinkPrefix, slug),
    posts: fsObject.children.filter(isPost),
    localAssets: fsObject.children.filter(isLocalAsset)
  }
  return {
    ..._.omit(fsObject, 'children'),
    type: contentTypes.CATEGORY,
    data
  }
}

module.exports = {
  createCategory
}
