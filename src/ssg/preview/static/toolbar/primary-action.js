import ToolbarItem from './toolbar-item.js'

export default class PrimaryAction extends ToolbarItem {
  static scheme() {
    return {
      onClick: {
        type: Function,
        required: true
      }
    }
  }

  constructor(options) {
    super(PrimaryAction.scheme, options)
    return this
  }

  onClick() {
    this.options.onClick.call(this)
  }
}
