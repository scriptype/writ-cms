const Model = require('../../../lib/Model')
const contentTypes = require('../contentTypes')

const LocalAsset = new Model({
  schema: (entry) => ({
    type: 'object'
  }),

  create(entry) {
    return {
      type: contentTypes.LOCAL_ASSET,
      data: {
        name: entry.data.name.data,
        path: entry.data.path.data,
        stats: entry.data.stats.data,
        depth: entry.data.depth.data,
        format: entry.data.format.data
      }
    }
  }
})

module.exports = LocalAsset
