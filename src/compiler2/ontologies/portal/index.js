const Settings = require('../../../settings')
const Ontology = require('../../lib/Ontology')
// const Assets = require('./models/assets')
// const LocalAsset = require('./models/localAsset')


module.exports = ({ ontologies }) => {
  const Models = {
    Homepage: require('./models/homepage'),
    Subpage: require('./models/subpage')
  }

  const SubOntologies = {
    view: 'should it have a view?',

    schema: (entry) => ({
      type: 'object',
      data: {
        name: ontologies.get
      },
    }),

    match: (entry, _schema) => {
      const schema = _schema || SubOntologies.schema(entry)
      return Object.keys(schema).every((key) => {
        const expected = schema[key]
        const actual = entry[key]?.data || entry[key]
        if (typeof expected === 'string') {
          return actual === expected
        }
        if (expected instanceof RegExp) {
          return !!actual.match(expected)
        }
        if (expected instanceof Function) {
          return expected(actual)
        }
        if (typeof expected === 'object') {
          return SubOntologies.match(actual, expected)
        }
      })
    },

    reduce: (model, entry) => {
      if (!SubOntologies.match(entry)) {
        return undefined
      }
      const subOntologyClass = ontologies.get(entry.data.name.data)
      const subOntology = new subOntologyClass(model, entry)
      return {
        ...model,
        [entry.data.name.data]: subOntology.contentModel
      }
    },

    render: (renderer, model) => {
      return Promise.resolve()
    }
  }

  /*
   * Organize Models together with their Views in a [modelName] folder?
   * */
  const HomepageCenter = {
    view: require('./views/homepage'),

    schema: (entry) => ({
      type: 'object',
      data: {
        name: /(homepage|home|index)/,
        format: /(markdown|plaintext|hypertext|handlebars)/,
      },
    }),

    match: (entry, _schema) => {
      const schema = _schema || HomepageCenter.schema(entry)
      return Object.keys(schema).every((key) => {
        const expected = schema[key]
        const actual = entry[key]
        if (typeof expected === 'string') {
          return (actual.data || actual) === expected
        }
        if (expected instanceof RegExp) {
          return !!(actual.data || actual).match(expected)
        }
        if (expected instanceof Function) {
          return expected(actual.data || actual)
        }
        if (key === 'data') {
          return HomepageCenter.match(actual, expected)
        }
      })
    },

    reduce: (model, entry) => {
      if (!HomepageCenter.match(entry)) {
        return undefined
      }
      const homepage = new Models.Homepage(entry)
      const newModel = {
        ...model,
        homepage: homepage.contentModel.data
      }
      return newModel
    },

    render: async (renderer, model) => {
      await HomepageCenter.view(renderer, model)
    }
  }

  /*
   *
   * Seeing if an interface emerges
   * Will merge with their models under a renewed interface?
   *
   * */
  const Subpages = {
    view: require('./views/subpages'),

    schema: (entry) => ({
      type: 'object',
      data: {
        format: /(markdown|plaintext|hypertext|handlebars)/
      }
    }),

    match: (entry, _schema) => {
      const schema = _schema || Subpages.schema(entry)
      return Object.keys(schema).every((key) => {
        const expected = schema[key]
        const actual = entry[key]
        if (typeof expected === 'string') {
          return (actual.data || actual) === expected
        }
        if (expected instanceof RegExp) {
          return !!(actual.data || actual).match(expected)
        }
        if (expected instanceof Function) {
          return expected(actual.data || actual)
        }
        if (key === 'data') {
          return Subpages.match(actual, expected)
        }
      })
    },

    reduce: (model, entry) => {
      if (!Subpages.match(entry)) {
        return undefined
      }
      const subpage = new Models.Subpage(entry)
      const newModel = {
        ...model,
        subpages: [
          ...(model.subpages || []),
          subpage.contentModel.data
        ]
      }
      return newModel
    },

    render: async (renderer, model) => {
      await Subpages.view(renderer, model)
    }
  }

  class Portal extends Ontology {
    constructor(contentTree) {
      super('portal', contentTree)
      this.contentModel = contentTree.reduce((model, entry) => {

        const withSubOntologies = SubOntologies.reduce(model, entry)
        if (withSubOntologies) {
          return withSubOntologies
        }

        const withHomepage = HomepageCenter.reduce(
          (withSubOntologies || model),
          entry
        )
        if (withHomepage) {
          return withHomepage
        }

        const withSubpages = Subpages.reduce(
          (withHomepage || withSubOntologies || model),
          entry
        )
        if (withSubpages) {
          return withSubpages
        }

        // localAssets

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
