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

        const withSubOntologies = this.subOntologies.reduce(contentModel, entry)
        if (withSubOntologies) {
          return withSubOntologies
        }

        const withHomepage = Homepage.reduce(
          (withSubOntologies || contentModel),
          entry
        )
        if (withHomepage) {
          return withHomepage
        }

        const withSubpages = Subpages.reduce(
          (withHomepage || withSubOntologies || contentModel),
          entry
        )
        if (withSubpages) {
          return withSubpages
        }

        const withLocalAssets = LocalAssets.reduce(
          (withSubpages || withHomepage || withSubOntologies || contentModel),
          entry
        )
        if (withLocalAssets) {
          return withLocalAssets
        }

        return contentModel
      }, {})
      // console.log('portal.contentModel', JSON.stringify(this.contentModel, null, 2))
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
