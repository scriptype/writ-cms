module.exports = class ImmutableStack {
  constructor(items = [])  {
    this.items = items
    return this
  }

  push(item) {
    return new ImmutableStack([...this.items, item])
  }

  pop() {
    const newItems = [...this.items].slice(0, -1)
    return new ImmutableStack(newItems)
  }

  throwUntil(searchFn) {
    const lastItemIndex = this.items.findLastIndex(searchFn)
    const newItems = [...this.items].slice(0, lastItemIndex + 1)
    return new ImmutableStack(newItems)
  }

  peek() {
    return this.items[this.items.length - 1]
  }

  serialize(key) {
    return this.items.reduce((acc, item, depth) => ({
      ...acc,
      [item[key]]: {
        ...item,
        depth
      }
    }), {})
  }
}
