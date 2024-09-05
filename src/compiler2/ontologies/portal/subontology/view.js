const Ontology = require('../../../lib/Ontology')

const renderSubOntology = async (renderer, contentModel) => {
  return Promise.all(
    Object.keys(contentModel).map(key => {
      const entry = contentModel[key]
      if (entry instanceof Ontology) {
        return entry.render(renderer, entry, contentModel)
      }
    })
  )
}

module.exports = renderSubOntology
