const Ontology = require('../../lib/Ontology')

class Blog extends Ontology {
  constructor(contentTree) {
    super('blog', contentTree)
    this.contentModel = 'blog contentModel'
    // console.log(`Blog contentTree`, JSON.stringify(contentTree, null, 2))
  }
}

module.exports = Blog
