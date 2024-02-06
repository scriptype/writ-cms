const createDecorator = require('./decorator')

const State = {}

const Methods = (() => {
  return {}
})()

module.exports = {
  ...Methods,
  decorator: createDecorator(State, Methods)
}
