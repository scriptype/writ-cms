export const query = document.querySelector.bind(document)

export const queryAll = document.querySelectorAll.bind(document)

export const parseScriptParameters = (src) => {
  const maybeBoolean = (value) => {
    return value === "true" ? true : (value === "false" ?  false : value)
  }

  const maybeNumber = (value) => {
    return !Number.isNaN(parseInt(value, 10)) ? parseInt(value, 10) : value
  }

  const parseValueType = (value) => {
    const booleanValue = maybeBoolean(value)
    if (booleanValue !== value) {
      return booleanValue
    }
    const numberValue = maybeNumber(value)
    if (numberValue !== value) {
      return booleanValue
    }
  }

  return src
    .split('?')
    .pop()
    .split('&')
    .reduce((params, part) => {
      let [key, value] = part.split('=')
      return {
        ...params,
        [key]: parseValueType(value)
      }
    }, {})
}

export const findParent = (element, selector) => {
  if (element === document.body) {
    return null
  }
  const el = document.createElement('div')
  el.innerHTML = element.parentElement.outerHTML
  if (el.querySelector(selector)) {
    return element.parentElement
  }
  return findParent(element.parentElement, selector)
}

export const omit = (object, keyToOmit) => {
  const keys = Object.keys(object)
  const restKeys = keys.filter(k => k !== keyToOmit)
  const restObject = restKeys.reduce((obj, key) => {
    return {
      ...obj,
      [key]: object[key]
    }
  }, {})
  return restObject
}

const forbiddenChars = 'äÄåÅÉéi̇ıİİöÖüÜçÇğĞşŞ'
const slugChars = 'aaaaeeiiiioouuccggss'
export const getSlug = (string) => {
  string = string.trim()
  string = string.replace(/\s+/g, '-')
  for (let i = 0; i < forbiddenChars.length - 1; i++) {
    const regex = new RegExp(forbiddenChars[i], 'gi')
    string = string.replace(regex, slugChars[i])
  }
  return string.toLowerCase()
}

export const stripTags = (string) => {
  var el = document.createElement('div')
  el.innerHTML = string
  return el.innerText
}
