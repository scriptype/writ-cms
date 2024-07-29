const Settings = require('../../../settings')
const { decorate } = require('../../../decorations')
const { pipe } = require('../../../helpers')
const Ontology = require('../../lib/Ontology')
const { withDates } = require('./models/enhancers')
const createModel = require('./models/createModel')

const FolderedHomepage = {
  create(contentTreeEntry) {
    const localAssets = fsObject.children.filter(isLocalAsset)
    const permalink = Settings.getSettings().permalinkPrefix

    const metadata = parseTemplate(contentTreeEntry, {
      permalink,
      localAssets
    })

    return new FolderedHomepage({
      template: metadata.template || contentTreeEntry.template || 'basic',
      title: metadata.title || '',
      content: metadata.content || '',
      mentions: metadata.mentions || [],
      ...metadata.attributes,
      localAssets,
      permalink
    })
  },
}

export default class Root extends Ontology {
  constructor(contentTree) {
    const { homepageDirectory } = Settings.getSettings()
    super(
      contentTree, 
      [{
        depth: 0,
        children: Array,
        name: new RegExp(`^(${homepageDirectory}|homepage|home)$`),
        model: FolderedHomepage.create
      }]
    )
  }

  async mapContentModel(contentTree, ontology) {
    return pipe(await createModel(contentTree), [
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
}
