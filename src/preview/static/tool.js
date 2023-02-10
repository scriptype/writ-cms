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

export default class Tool {
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
      buttonContent: {
        type: Function,
        required: true
      },
      activate: {
        type: Function,
        required: true
      },
      deactivate: {
        type: Function,
        required: true
      },
      save: {
        type: Function,
        required: true
      }
    }
  }

  static validateOptions(options) {
		const scheme = Tool.scheme()
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
        if (candidateType !== validType) {
          throw new MisTypedOptionError(key, validType)
        }
      }
    }

    return true
  }

  constructor(options) {
    Tool.validateOptions(options)
    this.options = options
    this.isActive = false
    return this
  }

  activate() {
    this.isActive = true
    this.options.activate.call(this)
    return this
  }

  deactivate() {
    this.isActive = false
    this.options.deactivate.call(this)
    return this
  }

  get(key) {
    return this[key] || this.options[key]
  }
}
