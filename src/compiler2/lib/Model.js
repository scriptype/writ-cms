class Model {
  constructor({ schema, create }) {
    if (!schema) {
      throw new Error('Model requires a schema')
    }
    if (typeof create !== 'function') {
      throw new Error('Model requires a create fn')
    }
    this.schema = schema
    this.create = create
  }

  match(entry, _schema) {
    const schema = _schema || this.schema(entry)
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
        return this.match(actual, expected)
      }
    })
  }
}

module.exports = Model
