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
let quillInstance

const svgIconPath = '/assets/expansions/content-editor/icon.svg'
const editableSections = ['title', 'content', 'summary']
const isSinglePage = (postTitle) => location.href.match(getSlug(postTitle))

const createUI = () => {
  return {
    unsavedChangesList: Templates.unsavedChanges.querySelector('#unsaved-changes-list'),
    editables: Array.from(
      queryAll('[data-editable="true"]')
    ),
    originals: Array.from(
      queryAll('[data-editable="true"]')
    ).map(o => ({
      path: o.dataset.path,
      section: o.dataset.section,
      value: o.innerHTML
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
    if (change.summary) {
      await Post.updateSummary(filePath, change)
    }
    if (change.title) {
      const response = await Post.updateTitle(filePath, change)
      if (change.shouldRedirect && response.redirected) {
        window.history.pushState({}, '', response.url)
      }
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

const pushChange = (path, change) => {
  State.unsavedChanges[path] = {
    ...State.unsavedChanges[path],
    ...change
  }
}

const makeEditable = (editable) => {
  if (!State.isActive) {
    return
  }

  let { path, section, foldered } = editable.dataset

  if (editableSections.indexOf(section) === -1) {
    return console.error('This section is not editable!')
  }

  const original = UI.originals.find(o => {
    return o.path === path && o.section === section
  })

  const change = {
    title: undefined,
    content: undefined,
    summary: undefined,
    foldered: foldered === 'true' || foldered === true,
    shouldRedirect: section === 'title' && isSinglePage(original.value)
  }

  if (section === 'title') {
    if (editable.dataset.section === 'title') {
      editable.contentEditable = true
    }
    editable.addEventListener('input', () => {
      change.title = editable.innerText.trim()
      pushChange(path, change)
    })

  } else {
    if (quillInstance) {
      quillInstance.enable()
      return console.log('quill already exists', Math.round(Math.random() * 1000))
    }
    console.log('create quill')
    editable.insertAdjacentHTML('beforeBegin', Templates.quillHelpers.innerHTML)
    quillInstance = Quill(editable)
    quillInstance.enable()
    quillInstance.on('text-change', () => {
      change[section] = quillInstance.root.innerHTML.trim()
      pushChange(path, change)
    })
  }

  renderChanges()
}

export default () => {
  document.title = stripTags(document.title)
  Templates = getTemplates()
  document.body.appendChild(Templates.unsavedChanges)
  document.body.appendChild(Templates.quillHelpers)
  State = getInitialState()
  UI = createUI()
  UI.editables.forEach(editable => {
    editable.addEventListener('click', () => makeEditable(editable))
  })

  return new window.Preview.Tool({
    id: 'content-editor',
    label: 'Content editor',
    async content() {
      return `
        ${await fetch(svgIconPath).then(r => r.text())}
        <p class="tool-btn-animation">
          <span>w</span>
          <span>r</span>
          <span>i</span>
          <span>t</span>
        </p>
      `
    },
    activate() {
      window.debugLog('activate content-editor')
      State.isActive = true
      document.body.classList.add('tool-content-editor-active')
    },
    deactivate() {
      window.debugLog('deactivate content-editor')
      State.isActive = false
      if (quillInstance) {
        quillInstance.disable()
      }
      document.body.classList.remove('tool-content-editor-active')
    },
    save
  })
}
