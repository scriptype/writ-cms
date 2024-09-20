const Ontology = require('../../lib/Ontology')
const SubOntologies = require('./subontology')
const Homepage = require('./homepage')
const Subpages = require('./subpage')
const LocalAssets = require('./localasset')

module.exports = ({ ontologies }) => {
  class Portal extends Ontology {
    constructor(contentTree) {
      super('portal', contentTree)

      this.subOntologies = SubOntologies({
        ontologies
      })

      this.contentModel = contentTree.reduce((contentModel, entry) => {
        return (
          this.subOntologies.reduce(contentModel, entry) ||
          Homepage.reduce(contentModel, entry) ||
          Subpages.reduce(contentModel, entry) ||
          LocalAssets.reduce(contentModel, entry) ||
          contentModel
        )
      }, {})
      console.log('portal.contentModel', JSON.stringify(this.contentModel, null, 2))
    }

    async render(renderer) {
      await this.subOntologies.render(renderer, this.contentModel)
      await Homepage.render(renderer, this.contentModel)
      await Subpages.render(renderer, this.contentModel)
      await LocalAssets.render(renderer, this.contentModel)
    }
  }

  return Portal
}
