export class MissingOptionError extends Error {
  constructor(optionName) {
    super(`"${optionName}" is required.`)
  }
}

export class MisTypedOptionError extends Error {
  constructor(optionName, rightType) {
    super(`"${optionName}" must be of type ${rightType}.`)
  }
}

export default class ToolbarItem {
  static scheme() {
    return {
      id: {
        type: String,
        required: true
      },
      label: {
        type: String,
        required: true
      },
      content: {
        type: Function,
        required: true
      }
    }
  }

  static validateOptions(subScheme, options) {
    const scheme = {
      ...ToolbarItem.scheme(),
      ...subScheme()
    }
    for (let key in scheme) {
      if (scheme.hasOwnProperty(key)) {
        if (!(key in scheme)) {
          throw new Error(`${key} not in scheme`)
        }
        const candidateType = typeof options[key]
        if (scheme[key].required && candidateType === 'undefined') {
          throw new MissingOptionError(key)
        }
        const validType = typeof scheme[key].type()
        if (scheme[key].required && candidateType !== validType) {
          throw new MisTypedOptionError(key, validType)
        }
      }
    }
    return true
  }

  constructor(subScheme, options) {
    ToolbarItem.validateOptions(subScheme, options)
    this.options = options
    return this
  }

  content() {
    return this.options.content.call(this)
  }

  get(key) {
    return this[key] || this.options[key]
  }
}
