const { decorate } = require('../../../../decorations')
const { pipe } = require('../../../../helpers')
const { withDates } = require('./enhancers')
const createModel = require('./createModel')

const createRoot = async (fileSystemTree) => {
  return pipe(await createModel(fileSystemTree), [
    async function rootSubpagesWithDates(contentModel) {
      console.log('createRoot CM', contentModel)
      return {
        ...contentModel,
        subpages: await Promise.all(
          (contentModel.subpages || []).map(withDates)
        )
      }
    }
  ])
}

module.exports = createRoot
