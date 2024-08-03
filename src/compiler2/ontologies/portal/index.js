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
        const actual = entry[key]
        if (typeof expected === 'string') {
          return actual.data === expected
        }
        if (expected instanceof RegExp) {
          console.log('expected is regex', entry, key)
          return !!actual.data.match(expected)
        }
        if (expected instanceof Function) {
          return expected(actual.data)
        }
        if (typeof expected === 'object') {
          console.log('expected is object', entry, key)
          return SubOntologies.match(actual, expected)
        }
      })
    },

    reduce: (model, entry) => {
      return model
      if (!SubOntologies.match(entry)) {
        return model
      }
      const subOntology = ontologies.get(entry.data.name.data)
      return {
        ...model,
        [entry.data.name.data]: entry.contentModel
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
      console.log('HomepageCenter.match schema', schema)
      return Object.keys(schema).every((key) => {
        const expected = schema[key]
        const actual = entry[key]
        if (typeof expected === 'string') {
          console.log('expected is string', entry, key)
          return (actual.data || actual) === expected
        }
        if (expected instanceof RegExp) {
          console.log('expected is regex', entry, key)
          return !!(actual.data || actual).match(expected)
        }
        if (expected instanceof Function) {
          return expected(actual.data || actual)
        }
        if (key === 'data') {
          console.log('expected is object', entry, key)
          return HomepageCenter.match(actual, expected)
        }
      })
    },

    reduce: (model, entry) => {
      console.log('HomepageCenter.reduce', model, entry)
      if (!HomepageCenter.match(entry)) {
        console.log('HomepageCenter other')
        return model
      }
      const homepage = new Models.Homepage(entry)
      console.log('HomepageCenter homepage', homepage)
      const newModel = {
        ...model,
        homepage: homepage.contentModel.data
      }
      console.log('HomepageCenter newModel', newModel)
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
      console.log('Subpages.match schema', schema)
      return Object.keys(schema).every((key) => {
        const expected = schema[key]
        const actual = entry[key]
        if (typeof expected === 'string') {
          console.log('expected is string', entry, key)
          return (actual.data || actual) === expected
        }
        if (expected instanceof RegExp) {
          console.log('expected is regex', entry, key)
          return !!(actual.data || actual).match(expected)
        }
        if (expected instanceof Function) {
          return expected(actual.data || actual)
        }
        if (key === 'data') {
          console.log('expected is object', entry, key)
          return Subpages.match(actual, expected)
        }
      })
    },

    reduce: (model, entry) => {
      console.log('Subpages.reduce', model, entry)
      if (!Subpages.match(entry)) {
        console.log('Subpages other')
        return model
      }
      const subpage = new Models.Subpage(entry)
      console.log('Subpages subpage', subpage)
      const newModel = {
        ...model,
        subpages: [
          ...(model.subpages || []),
          subpage.contentModel.data
        ]
      }
      console.log('Subpages newModel', newModel)
      return newModel
    },

    render: async (renderer, model) => {
      console.log('subpages.render contentModel', model)
      await Subpages.view(renderer, model)
    }
  }

  class Portal extends Ontology {
    constructor(contentTree) {
      super(contentTree)
      this.contentModel = contentTree.tree.reduce((model, entry) => {
        console.log('portal.contentTree.reduce', model, entry)

        const maybeWithSubOntologies = SubOntologies.reduce(model, entry)
        console.log('portal.contentTree.reduce withSubOntologies', maybeWithSubOntologies, entry)

        const maybeWithHomepage = HomepageCenter.reduce(maybeWithSubOntologies, entry)
        console.log('portal.contentTree.reduce withHomepage', maybeWithHomepage, entry)

        const maybeWithSubpages = Subpages.reduce(maybeWithHomepage, entry, entry)
        console.log('portal.contentTree.reduce withSubpages', maybeWithSubpages)

        return maybeWithSubpages
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
