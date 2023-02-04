import Post from '../models/post.js'
import Quill from './quill.js'
import {
  queryAll,
  findParent,
  getSlug,
  stripTags
} from './helpers.js'

let State
let Templates
let UI

const createUI = (templates) => {
  return {
    unsavedChangesList: templates.unsavedChanges.querySelector('#unsaved-changes-list'),
    editables: Array.from(
      queryAll('[data-editable="true"]')
    ),
    originals: Array.from(
      queryAll('[data-editable="true"]')
    ).map(o => ({
      path: o.dataset.path,
      section: o.dataset.section,
      content: o.innerHTML
    }))
  }
}

const getTemplates = () => {
  const templates = Array.from(queryAll('template[id^="tmpl-"]'))
  return templates.reduce((result, template) => {
    const key = window._.camelCase(template.id.replace(/^tmpl-/, ''))
    return {
      ...result,
      [key]: template.content.firstElementChild
    }
  }, {})
}

const getInitialState = () => {
  return {
    isActive: false,
    unsavedChanges: {}
  }
}

const stripTagsFromDocumentTitle = () => {
  document.title = stripTags(document.title)
}

const mountTemplate = (DOMNode) => {
  document.body.appendChild(DOMNode)
}

const mountFrontend = () => {
  stripTagsFromDocumentTitle()
  const templates = getTemplates()
  mountTemplate(templates.unsavedChanges)
  mountTemplate(templates.quillHelpers)
  return templates
}

const save = () => {
  const unsavedChanges = State.unsavedChanges || {}
  window.debugLog('changes', unsavedChanges)
  Object.keys(unsavedChanges).forEach(async (filePath) => {
    const change = unsavedChanges[filePath]
    if (!change) {
      return
    }
    if (change.content) {
      await Post.updateContent(filePath, change)
    }
    if (change.title) {
      const response = await Post.updateTitle(filePath, change)
      if (change.shouldRedirect && response.redirected) {
        window.history.pushState({}, '', response.url)
      }
    }
  })
}

const toggleActivate = () => {
  const { isActive } = State

  const editors = window.editors || []
  editors.forEach(e => e.quill.enable(isActive))

  document.body.classList.toggle('tool-content-editor-active', isActive)
  UI.editables.forEach(editable => {
    if (editable.dataset.section === 'title') {
      editable.contentEditable = isActive
    }
  })
}

const renderChanges = () => {
  const changes = State.unsavedChanges
  UI.unsavedChangesList.innerHTML = Object.keys(changes).map(path => `
    ${Object.keys(changes[path]).map(key => `
      <li>${path} (${changes[path][key]})</li>
    `)}
  `).join('')
  Templates.unsavedChanges.classList.toggle('unsaved', Object.keys(changes).length)
}

const getQuill = (contentElement) => {
  const existingEditor = (window.editors || []).find(
    e => e.editable === contentElement
  )

  if (existingEditor) {
    return existingEditor.quill
  }

  contentElement.insertAdjacentHTML('beforeBegin', Templates.quillHelpers.innerHTML)
  window.editors = window.editors || []
  const quill = Quill(contentElement)
  window.editors.push({
    editable: contentElement,
    quill
  })
  if (!State.isActive) {
    quill.disable()
  }
  return quill
}

const pushChange = (path, change) => {
  State.unsavedChanges[path] = {
    ...State.unsavedChanges[path],
    ...change
  }
}

const onChangeTitle = (titleElement) => {
  let { path, section, foldered } = titleElement.dataset
  const originalContent = UI.originals.find(c => c.path === path && c.section === section).content
  return titleElement.addEventListener('input', () => {
    pushChange(path, {
      title: titleElement.innerText.trim(),
      foldered: foldered === 'true' || foldered === true,
      shouldRedirect: location.href.match(getSlug(originalContent))
    })
    renderChanges()
  })
}

const onChangeContent = (contentElement) => {
  let { path, foldered } = contentElement.dataset
  let quill = getQuill(contentElement)

  quill.on('text-change', (delta, source) => {
    pushChange(path, {
      content: quill.root.innerHTML.trim(),
      foldered: foldered === 'true' || foldered === true
    })
    renderChanges()
  })
}

const listenToChanges = () => {
  UI.editables.forEach((editable, i) => {
    let { section } = editable.dataset
    if (section === 'title') {
      onChangeTitle(editable)
    } else if (section === 'content') {
      onChangeContent(editable)
    }
  })
}

const preventLinkClickInEditMode = () => {
  UI.editables.forEach((editable, i) => {
    editable.addEventListener('click', e => {
      if (State.isActive && findParent(editable, 'a')) {
        e.preventDefault()
      }
    })
  })
}

export default () => {
  State = getInitialState()
  State = {
  isActive: false,
  unsavedChanges: {}
}
  Templates = mountFrontend()
  UI = createUI(Templates)
  listenToChanges()
  preventLinkClickInEditMode()
  toggleActivate()

  return new window.Preview.Tool({
    id: 'content-editor',
    label: 'Edit',
    activate() {
      State.isActive = true
      toggleActivate()
      window.debugLog('activate content-editor')
    },
    deactivate() {
      State.isActive = false
      toggleActivate()
      window.debugLog('deactivate content-editor')
    },
    save
  })
}
