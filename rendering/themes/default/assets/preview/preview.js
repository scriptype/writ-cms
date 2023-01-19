const parseScriptParameters = (src) => {
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

const query = document.querySelector.bind(document)
const queryAll = document.querySelectorAll.bind(document)

const { debug } = parseScriptParameters(query('script#preview').src)
const debugLog = (...args) => debug ? console.log(...args) : undefined

const editorTemplate = query('#editor-tmpl')
const editorElement = editorTemplate.content.firstElementChild
const unsavedChangesList = editorElement.querySelector('#unsaved-changes-list')

const rebuild = () => {
  return fetch('/cms/refresh')
}

const Post = {
  updateContent(path, content) {
    return fetch(`/cms/post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content,
        path
      })
    })
  },

  updateTitle(path, title, foldered) {
    return fetch(`/cms/post`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title,
        updateUrl: true,
        path,
        foldered
      })
    })
  }
}

const findParent = (element, selector) => {
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

const omit = (object, keyToOmit) => {
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

const restoreSeeMore = (content) => {
  const el = document.createElement('div')
  el.innerHTML = content
  const seeMore = el.querySelector('[data-section="summary"]')
  const parentNode = seeMore.parentNode
  const grandParentNode = parentNode.parentNode
  if (grandParentNode && !grandParentNode.querySelector('[data-section="content"]')) {
    const isFirst = !seeMore.previousSibling
    const isOnly = isFirst && !seeMore.nextSibling
    const insertPosition = isFirst ? 'beforeBegin' : 'afterEnd'
    parentNode.insertAdjacentElement(insertPosition, seeMore)
    if (isOnly) {
      parentNode.remove()
    }
    return restoreSeeMore(el.innerHTML)
  }
  seeMore.replaceWith('\{\{seeMore}}')
  return el.innerHTML
}

const toggleEditMode = (isEditMode) => {
  document.body.classList.toggle('edit-mode')
  editMode = !editMode
  editables.forEach(editable => {
    editable.contentEditable = isEditMode
  })
}

const forbiddenChars = 'äÄåÅÉéi̇ıİİöÖüÜçÇğĞşŞ'
const slugChars = 'aaaaeeiiiioouuccggss'

const getSlug = (string) => {
  string = string.trim()
  string = string.replace(/\s+/g, '-')
  for (let i = 0; i < forbiddenChars.length - 1; i++) {
    const regex = new RegExp(forbiddenChars[i], 'gi')
    string = string.replace(regex, slugChars[i])
  }
  return string.toLowerCase()
}

let editMode = false
let unsavedChanges = {}

document.body.appendChild(editorElement)
document.title = (() => {
  var el = document.createElement('div')
  el.innerHTML = document.title
  return el.innerText
})()

query('#rebuild-btn').addEventListener('click', () => {
  rebuild()
})

query('#save-btn').addEventListener('click', async () => {
  debugLog('changes', unsavedChanges)
  Object.keys(unsavedChanges).forEach(async (filePath) => {
    const change = unsavedChanges[filePath]
    if (!change) {
      return
    }
    if (change.content) {
      await Post.updateContent(filePath, restoreSeeMore(change.content))
    }
    if (change.title) {
      const response = await Post.updateTitle(filePath, change.title, change.foldered)
      if (change.ownPageChange && response.redirected) {
        window.history.pushState({}, '', response.url)
      }
    }
  })
})

query('#edit-mode').addEventListener('change', (e) => {
  toggleEditMode(e.target.checked)
  localStorage.setItem(localStorageKey, JSON.stringify({
    editMode
  }))
})

const editables = Array.from(queryAll('[data-editable="true"]'))
const originals = editables.map(e => ({
  path:
  e.dataset.section === 'summary' ?
  findParent(e, '[data-section="content"]').dataset.path :
  e.dataset.path,
  content: e.innerHTML
}))

editables.forEach(editable => {
  let { section, path, foldered } = editable.dataset
  if (section === 'summary') {
    path = findParent(editable, '[data-section="content"]').dataset.path
  }
  const originalContent = originals.find(c => c.path === path).content

  editable.addEventListener('input', (e) => {
    const isSameContent = originalContent === editable.innerHTML
    if (isSameContent) {
      const otherChanges = omit(omit(unsavedChanges[path], section), 'foldered')
      if (Object.keys(otherChanges).length) {
        unsavedChanges[path] = otherChanges
      } else {
        unsavedChanges = omit(unsavedChanges, path)
      }
    } else {
      unsavedChanges[path] = {
        ...unsavedChanges[path],
        [section]: editable.innerHTML.trim(),
        foldered: foldered === 'true' || foldered === true,
        ownPageChange: section === 'title' && location.href.match(getSlug(originalContent))
      }
    }
    unsavedChangesList.innerHTML = Object.keys(unsavedChanges).map(path => `
        ${Object.keys(unsavedChanges[path]).map(key => `
          <li>${path} (${unsavedChanges[path][key]})</li>
        `)}
      `).join('')
    editorElement.classList.toggle('unsaved', Object.keys(unsavedChanges).length)
  })

  editable.addEventListener('click', e => {
    if (editMode && findParent(editable, 'a')) {
      e.preventDefault()
    }
  })
})

const localStorageKey = 'editor'
const store = localStorage.getItem(localStorageKey)

if (store && JSON.parse(store) && JSON.parse(store).editMode) {
  query('#edit-mode').checked = true
  toggleEditMode(true)
}

