const test = require('tape')
const ImmutableStack = require('./ImmutableStack')

test('ImmutableStack constructor', t => {
  t.test('creates empty stack by default', t => {
    const stack = new ImmutableStack()
    t.equal(stack.items.length, 0)
    t.end()
  })

  t.test('creates stack with initial items', t => {
    const items = [1, 2, 3]
    const stack = new ImmutableStack(items)
    t.deepEqual(stack.items, items)
    t.end()
  })

  t.end()
})

test('ImmutableStack push', t => {
  t.test('adds item to empty stack', t => {
    const stack = new ImmutableStack()
    const newStack = stack.push(1)
    t.deepEqual(newStack.items, [1])
    t.notEqual(newStack, stack)
    t.end()
  })

  t.test('adds item to existing stack', t => {
    const stack = new ImmutableStack([1, 2])
    const newStack = stack.push(3)
    t.deepEqual(newStack.items, [1, 2, 3])
    t.notEqual(newStack, stack)
    t.end()
  })

  t.end()
})

test('ImmutableStack pop', t => {
  t.test('removes last item from stack', t => {
    const stack = new ImmutableStack([1, 2, 3])
    const newStack = stack.pop()
    t.deepEqual(newStack.items, [1, 2])
    t.notEqual(newStack, stack)
    t.end()
  })

  t.test('handles empty stack', t => {
    const stack = new ImmutableStack()
    const newStack = stack.pop()
    t.deepEqual(newStack.items, [])
    t.notEqual(newStack, stack)
    t.end()
  })

  t.end()
})

test('ImmutableStack peek', t => {
  t.test('returns last item', t => {
    const stack = new ImmutableStack([1, 2, 3])
    t.equal(stack.peek(), 3)
    t.end()
  })

  t.test('returns undefined for empty stack', t => {
    const stack = new ImmutableStack()
    t.equal(stack.peek(), undefined)
    t.end()
  })

  t.end()
})

test('ImmutableStack throwUntil', t => {
  t.test('throws until matching item', t => {
    const stack = new ImmutableStack([1, 2, 3, 4])
    const newStack = stack.throwUntil(item => item === 2)
    t.deepEqual(newStack.items, [1, 2])
    t.notEqual(newStack, stack)
    t.end()
  })

  t.test('throws until last matching item', t => {
    const stack = new ImmutableStack([1, 2, 3, 2, 4])
    const newStack = stack.throwUntil(item => item === 2)
    t.deepEqual(newStack.items, [1, 2, 3, 2])
    t.notEqual(newStack, stack)
    t.end()
  })

  t.test('returns empty stack if no match', t => {
    const stack = new ImmutableStack([1, 2, 3])
    const newStack = stack.throwUntil(item => item === 4)
    t.deepEqual(newStack.items, [])
    t.notEqual(newStack, stack)
    t.end()
  })

  t.end()
})

test('ImmutableStack serialize', t => {
  t.test('serializes with key', t => {
    const items = [
      { key: 'a', value: 1 },
      { key: 'b', value: 2 }
    ]
    const stack = new ImmutableStack(items)
    const result = stack.serialize('key')
    t.deepEqual(result, {
      a: { key: 'a', value: 1, depth: 0 },
      b: { key: 'b', value: 2, depth: 1 }
    })
    t.end()
  })

  t.test('handles empty stack', t => {
    const stack = new ImmutableStack()
    const result = stack.serialize('key')
    t.deepEqual(result, {})
    t.end()
  })

  t.end()
})
