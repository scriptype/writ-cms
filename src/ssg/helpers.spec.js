const test = require('tape')
const { pipe, pipeSync, rightPad, curry } = require('./helpers')

test('pipe with async functions', async (t) => {
  const times2 = (x) => Promise.resolve(x * 2)
  const addFive = (x) => Promise.resolve(x + 5)
  const subtract3 = (x) => Promise.resolve(x - 3)
  const divideBy2 = (x) => Promise.resolve(x / 2)

  const result = await pipe(3, [times2, addFive, subtract3, divideBy2])

  t.equal(
    result,
    4,
    'pipes through multiple async functions in sequence'
  )
})

test('pipe with single function', async (t) => {
  const addTen = (x) => Promise.resolve(x + 10)

  const result = await pipe(5, [addTen])

  t.equal(
    result,
    15,
    'works with single function'
  )
})

test('pipe with empty functions array', async (t) => {
  const result = await pipe(42, [])

  t.equal(
    result,
    42,
    'returns initial value when no functions provided'
  )
})

test('pipe with multiple async functions', async (t) => {
  const asyncOp = (x) => Promise.resolve(x * 3)
  const anotherOp = (x) => Promise.resolve(x - 1)
  const finalOp = (x) => Promise.resolve(x / 2)

  const result = await pipe(10, [asyncOp, anotherOp, finalOp])

  t.equal(
    result,
    14.5,
    'chains multiple async functions together'
  )
})

test('pipe rejects when async function throws', async (t) => {
  const throwError = () => Promise.reject(new Error('test error'))

  try {
    await pipe(5, [throwError])
    t.fail('should have thrown an error')
  } catch (error) {
    t.equal(
      error.message,
      'test error',
      'propagates promise rejection'
    )
  }
})

test('pipe with async object transformations', async (t) => {
  const addName = (obj) => Promise.resolve({ ...obj, name: 'test' })
  const addAge = (obj) => Promise.resolve({ ...obj, age: 25 })
  const addCity = (obj) => Promise.resolve({ ...obj, city: 'NYC' })

  const result = await pipe({}, [addName, addAge, addCity])

  t.deepEqual(
    result,
    { name: 'test', age: 25, city: 'NYC' },
    'chains async object transformations'
  )
})

test('pipeSync with sync functions', (t) => {
  const times2 = (x) => x * 2
  const addFive = (x) => x + 5
  const subtract3 = (x) => x - 3
  const divideBy2 = (x) => x / 2

  const result = pipeSync(3, [times2, addFive, subtract3, divideBy2])

  t.equal(
    result,
    4,
    'pipes through multiple sync functions in sequence'
  )

  t.end()
})

test('pipeSync with single function', (t) => {
  const addTen = (x) => x + 10

  const result = pipeSync(5, [addTen])

  t.equal(
    result,
    15,
    'works with single function'
  )

  t.end()
})

test('pipeSync with empty functions array', (t) => {
  const result = pipeSync(42, [])

  t.equal(
    result,
    42,
    'returns initial value when no functions provided'
  )

  t.end()
})

test('pipeSync with object operations', (t) => {
  const addName = (obj) => {
    return { ...obj, name: 'test' }
  }
  const addAge = (obj) => {
    return { ...obj, age: 25 }
  }
  const addCity = (obj) => {
    return { ...obj, city: 'NYC' }
  }
  const addCountry = (obj) => {
    return { ...obj, country: 'USA' }
  }

  const result = pipeSync(
    {},
    [addName, addAge, addCity, addCountry]
  )

  t.deepEqual(
    result,
    { name: 'test', age: 25, city: 'NYC', country: 'USA' },
    'handles multiple object transformations'
  )

  t.end()
})

test('rightPad basic usage', (t) => {
  const result = rightPad('hi', 5)

  t.equal(
    result,
    'hi   ',
    'pads string with spaces to specified length'
  )

  t.end()
})

test('rightPad with custom character', (t) => {
  const result = rightPad('ab', 5, '-')

  t.equal(
    result,
    'ab---',
    'pads with custom character'
  )

  t.end()
})

test('rightPad when string is already longer than amount', (t) => {
  const result = rightPad('hello world', 5)

  t.equal(
    result,
    'hello',
    'truncates string to specified length'
  )

  t.end()
})

test('rightPad with amount zero', (t) => {
  const result = rightPad('hello', 0)

  t.equal(
    result,
    '',
    'returns empty string when amount is zero'
  )

  t.end()
})

test('rightPad with empty string', (t) => {
  const result = rightPad('', 5)

  t.equal(
    result,
    '     ',
    'pads empty string to specified length'
  )

  t.end()
})

test('rightPad with multi-character padding', (t) => {
  const result = rightPad('ab', 10, 'xy')

  t.equal(
    result,
    'abxyxyxyxy',
    'repeats multi-character padding'
  )

  t.end()
})

test('curry basic usage', (t) => {
  const add = (a, b, c) => a + b + c
  const curriedAdd = curry(add)

  const addFive = curriedAdd(5)
  const result = addFive(3, 2)

  t.equal(
    result,
    10,
    'partially applies first argument'
  )

  t.end()
})

test('curry with single argument function', (t) => {
  const times2 = (x) => x * 2
  const curriedTimes2 = curry(times2)

  const boundTimes2 = curriedTimes2(5)
  const result = boundTimes2()

  t.equal(
    result,
    10,
    'works with single argument functions'
  )

  t.end()
})

test('curry with no arguments in final call', (t) => {
  const greet = (name, greeting = 'hello') => `${greeting} ${name}`
  const curriedGreet = curry(greet)

  const sayHelloTo = curriedGreet('world')
  const result = sayHelloTo()

  t.equal(
    result,
    'hello world',
    'uses default arguments in final call'
  )

  t.end()
})

test('curry with no partial application', (t) => {
  const multiply = (x, y) => x * y
  const curriedMultiply = curry(multiply)

  const boundMultiply = curriedMultiply(6, 7)
  const result = boundMultiply()

  t.equal(
    result,
    42,
    'works when all arguments provided at once'
  )

  t.end()
})

test('curry returns function', (t) => {
  const add = (a, b) => a + b
  const curriedAdd = curry(add)
  const partial = curriedAdd(5)

  t.equal(
    typeof partial,
    'function',
    'returns a function when partially applied'
  )

  t.end()
})
