class Flag {
  static isFlag(value) {
    return value.startsWith('--') || value.startsWith('-')
  }

  static isNotFlag(value) {
    return !Flag.isFlag(value)
  }

  constructor(full, shorthand) {
    this.full = full
    this.shorthand = shorthand
    return this
  }

  test(value) {
    if (Array.isArray(value)) {
      return !!value.find(v => v === `--${this.full}` || v === `-${this.shorthand}`)
    }
    return value === `--${this.full}` || value === `-${this.shorthand}`
  }
}

module.exports = Flag
