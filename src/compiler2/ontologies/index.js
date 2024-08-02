const Ontologies = {
  blog: require('./blog')
}

const api = {
  get(name) {
    return Ontologies[name]
  }
}

Ontologies.portal = require('./portal')({
  ontologies: api
})

module.exports = api
