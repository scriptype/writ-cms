const { decorate } = require('../../decorations')
const { pipe } = require('../../helpers')
const createRoot = require('./models/root')

const ContentModel = {
  async create(fileSystemTree) {
    const contentModel = pipe(await createRoot(fileSystemTree), [
      decorate.bind(null, 'contentModel'),
    ])
    return contentModel
  }
}

module.exports = ContentModel
