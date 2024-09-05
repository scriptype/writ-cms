const Settings = require('../../../../settings')
const contentTypes = require('../contentTypes')
const Model = require('../../../lib/Model')

const SubOntology = ({ ontologies }) => new Model({
  schema: (entry) => ({
    type: 'object',
    data: {
      name: ontologies.get
    },
  }),

  create: (entry) => {
    const subOntologyClass = ontologies.get(entry.data.name.data)
    return {
      type: contentTypes.SUB_ONTOLOGY,
      data: new subOntologyClass(entry)
    }
  }
})

module.exports = SubOntology
