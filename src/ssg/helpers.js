const pipe = (initialValue, functions) => {
  return functions.reduce(async (acc, fn) => fn(await acc), initialValue)
}

const pipeSync = (initialValue, functions) => {
  return functions.reduce((acc, fn) => fn(acc), initialValue)
}

const rightPad = (str, amount, character = ' ') => {
  return `${str}${character.repeat(amount)}`.slice(0, amount)
}

const curry = (fn) => {
  return (...args) => fn.bind(null, ...args)
}

module.exports = {
  pipe,
  pipeSync,
  rightPad,
  curry
}
