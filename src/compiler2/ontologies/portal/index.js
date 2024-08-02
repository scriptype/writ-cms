const Settings = require('../../../settings')
const Ontology = require('../../lib/Ontology')
// const Assets = require('./models/assets')
// const LocalAsset = require('./models/localAsset')
const Homepage = require('./models/homepage')
const Subpage = require('./models/subpage')

const Views = {
  homepage: require('./views/homepage'),
  subpages: require('./views/subpages')
}

module.exports = ({ ontologies }) => {
  const SubOntologies = {
    sense: (entry) => {
      if (entry.type !== 'object') {
        return entry
      }
      const subOntology = ontologies.get(entry.data.name.data)
      if (!subOntology) {
        return entry
      }
      return new subOntology(entry)
    },

    reduce: (model, entry) => {
      return model
      return {
        ...model,
        [entry.name]: entry.contentModel
      }
    },

    render: (renderer, model) => {
    }
  }

  const HomepageCenter = {
    sense: (entry) => {
      if (entry.type !== 'object') {
        return entry
      }
      if (!entry.data.format.data.match(/(markdown|plaintext|hypertext|handlebars)/)) {
        return entry
      }
      if (!entry.data.name.data.match(/(homepage|home|index)/)) {
        return entry
      }
      return new Homepage(entry)
    },

    reduce: (model, entry) => {
      return {
        ...model,
        homepage: entry.contentModel.data
      }
    },

    render: async (renderer, model) => {
      await Views.homepage(renderer, model)
    }
  }

  const Subpages = {
    sense: (entry) => {
      if (entry.type !== 'object') {
        return entry
      }
      if (!entry.data.format.data.match(/(markdown|plaintext|hypertext|handlebars)/)) {
        return entry
      }
      return new Subpage(entry)
    },

    reduce: (model, entry) => {
      return {
        ...model,
        subpages: [
          ...(model.subpages || []),
          entry.contentModel.data
        ]
      }
    },

    render: async (renderer, model) => {
      await Views.subpages(renderer, model)
    }
  }

  class Portal extends Ontology {
    constructor(contentTree) {
      super(contentTree)
      // console.log('rootOntology portal')
      this.contentModel = contentTree.tree.reduce((model, entry) => {
        const subOntology = SubOntologies.sense(entry)
        if (subOntology instanceof Ontology) {
          console.log('sensed subontology')
          return SubOntologies.reduce(model, subOntology)
        }
        const homepage = HomepageCenter.sense(entry)
        if (homepage instanceof Homepage) {
          console.log('sensed homepage')
          return HomepageCenter.reduce(model, homepage)
        }
        const subpage = Subpages.sense(entry)
        if (subpage instanceof Subpage) {
          console.log('sensed subpage')
          return Subpages.reduce(model, subpage)
        }
        return model
      }, {})
      console.log('portal.contentModel', JSON.stringify(this.contentModel, null, 2))
    }

    async render(renderer) {
      await SubOntologies.render(renderer, this.contentModel)
      await HomepageCenter.render(renderer, this.contentModel)
      await Subpages.render(renderer, this.contentModel)
    }
  }

  return Portal
}
