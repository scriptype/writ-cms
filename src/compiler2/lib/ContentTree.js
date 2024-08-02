const assert = require('assert')

class ContentTree {
  constructor(tree) {
    this.tree = tree
  }
}

class ContentTreeEntry {
  constructor({ type, data, subTree }) {
    this.type = assert(typeof type === 'string') || type
    this.data = assert(data instanceof Array) || data
    this.subTree = assert(Number.isInteger(subTree)) || subTree
  }
}

module.exports = {
  ContentTree,
  ContentTreeEntry,
}
