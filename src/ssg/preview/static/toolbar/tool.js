import ToolbarItem from './toolbar-item.js'

export default class Tool extends ToolbarItem {
  static baseScheme() {
    return {
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

  constructor(options) {
    super(Tool.scheme, options)
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

  save() {
    const saveFn = this.options.save
    if (saveFn) {
      saveFn.call(this)
    }
  }
}
