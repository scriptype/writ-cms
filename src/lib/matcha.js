const { isDataFile, isTemplateFile } = require('./contentModelHelpers')

const logicFnMap = {
  'or': 'some',
  'and': 'every'
}

const matcha = {
  helpers: {}
}

matcha.helpers.computeOptions = (options, fsNode) => {
  const result = {}
  if (options.nameOptions) {
    if (typeof options.nameOptions === 'function') {
      result.nameOptions = options.nameOptions(fsNode)
    }
    result.nameOptions = options.nameOptions
  }
  return result
}

matcha.true = () => fsNode => true
matcha.false = () => fsNode => false

matcha.either = (...matchers) => {
  return {
    logic: 'or',
    matchers
  }
}

matcha.and = (...matchers) => {
  return {
    logic: 'and',
    matchers
  }
}

matcha.directory = (options = {}) => {
  return (fsNode) => {
    const { nameOptions } = matcha.helpers.computeOptions(options, fsNode)
    if (!fsNode.children) {
      return false
    }

    let nameMatch = true
    if (nameOptions) {
      nameMatch = fsNode.name.match(
        new RegExp(`^(${nameOptions.join('|')})$`)
      )
    }
    if (!nameMatch) {
      return false
    }

    let childrenMatch = true
    if (options.children) {
      const logicFn = logicFnMap[options.children.logic || 'and']
      const matchers = options.children.matchers || options.children
      childrenMatch = matchers[logicFn](childMatcher => {
        return fsNode.children.some(childMatcher)
      })
    }
    if (childrenMatch) {
      return true
    }

    let recursionMatch = options.childSearchDepth && Number.isInteger(options.childSearchDepth)
    if (recursionMatch) {
      recursionMatch = fsNode.children.some(
        matcha.directory({
          ...options,
          childSearchDepth: options.childSearchDepth - 1
        })
      )
    }
    return recursionMatch
  }
}
matcha.dataFile = (options = {}) => {
  return (fsNode) => {
    const { nameOptions } = matcha.helpers.computeOptions(options, fsNode)
    return (
      isDataFile(fsNode) &&
      fsNode.name.match(
        new RegExp(`^(${nameOptions.join('|')})\\..+$`)
      )
    )
  }
}

matcha.indexFile = (options = {}) => {
  return (fsNode) => {
    const { nameOptions } = matcha.helpers.computeOptions(options, fsNode)
    return (
      isTemplateFile(fsNode) &&
      fsNode.name.match(
        new RegExp(`^(${nameOptions.join('|')})\\..+$`)
      )
    )
  }
}

matcha.folderable = (options = {}) => {
  return (fsNode) => {
    const { nameOptions } = matcha.helpers.computeOptions(options, fsNode)
    return isTemplateFile(fsNode) || fsNode.children?.find(
      matcha.indexFile({
        nameOptions: nameOptions.index
      })
    )
  }
}

matcha.namedFolderable = (options = {}) => {
  return fsNode => {
    const { nameOptions } = matcha.helpers.computeOptions(options, fsNode)
    const namedFile = matcha.indexFile({
      nameOptions: nameOptions.index
    })(fsNode)
    return namedFile || matcha.directory({
      nameOptions: nameOptions.folder,
      children: [namedFile]
    })(fsNode)
  }
}

module.exports = matcha
