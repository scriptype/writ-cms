const { isDataFile, isTemplateFile } = require('./contentModelHelpers')

const matcha = {
  helpers: {}
}

matcha.helpers.computeOptions = (options, fsNode) => {
  const result = {}
  if (options.nameOptions) {
    result.nameOptions = options.nameOptions
    if (typeof options.nameOptions === 'function') {
      result.nameOptions = options.nameOptions(fsNode)
    }
  }
  return result
}

matcha.true = () => fsNode => true
matcha.false = () => fsNode => false

matcha.either = (...matchers) => (fsNode) => {
  if (Array.isArray(fsNode)) {
    return matchers.some(matcher => fsNode.some(matcher))
  }
  return matchers.some(matcher => matcher(fsNode))
}

matcha.and = (...matchers) => (fsNode) => {
  if (Array.isArray(fsNode)) {
    return matchers.every(matcher => fsNode.some(matcher))
  }
  return matchers.every(matcher => matcher(fsNode))
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
      if (typeof options.children === 'function') {
        childrenMatch = options.children(fsNode.children)
      } else {
        childrenMatch = options.children.every(childMatcher => {
          return fsNode.children.some(childMatcher)
        })
      }
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
      isDataFile(fsNode) && (
        !nameOptions || fsNode.name.match(
          new RegExp(`^(${nameOptions.join('|')})\\..+$`)
        )
      )
    )
  }
}

matcha.templateFile = (options = {}) => {
  return (fsNode) => {
    const { nameOptions } = matcha.helpers.computeOptions(options, fsNode)
    return (
      isTemplateFile(fsNode) && (
        !nameOptions || fsNode.name.match(
          new RegExp(`^(${nameOptions.join('|')})\\..+$`)
        )
      )
    )
  }
}

matcha.folderable = (options = {}) => {
  return (fsNode) => {
    const { nameOptions = {} } = matcha.helpers.computeOptions(options, fsNode)
    const standaloneFileMatcher = matcha.templateFile({
      nameOptions: nameOptions.standalone
    })
    const indexedDirectoryMatcher = matcha.directory({
      nameOptions: nameOptions.folder,
      children: [
        matcha.templateFile({
          nameOptions: nameOptions.index
        })
      ]
    })
    return standaloneFileMatcher(fsNode) || indexedDirectoryMatcher(fsNode)
  }
}

module.exports = matcha
