import Tool from './tool.js'

const createDOMNodeFromHTML = (html) => {
  const el = document.createElement('div')
  el.innerHTML = html
  return el.firstElementChild
}

const Toolbar = (() => {
  const createToolButton = (tool) => {
    const id = tool.get('id')
    const label = tool.get('label')
    const btn = createDOMNodeFromHTML(`
      <div class="toolbar-item tool-btn">
        <input type="checkbox" id="tool-btn-${id}" />
        <label for="tool-btn-${id}">
          ${label}
        </label>
      </div>
    `)

    const checkbox = btn.querySelector(`#tool-btn-${id}`)
    checkbox.addEventListener('change', (event) => {
      if (!event.target.checked) {
        tool.deactivate()
      } else {
        tool.activate()
      }
    })

    return btn
  }

  const handleToolbarItemHover = (toolbarItem) => {
    toolbarItem.addEventListener('mouseover', () => el.classList.add('expanded'))
    toolbarItem.addEventListener('mouseout', () => el.classList.remove('expanded'))
    toolbarItem.addEventListener('focus', () => el.classList.add('expanded'))
    toolbarItem.addEventListener('blur', () => el.classList.remove('expanded'))
  }

  const insertToolButton = (tool) => {
    const btn = createToolButton(tool)
    handleToolbarItemHover(btn)
    el.appendChild(btn)
  }

  const insertSaveButton = (onSave) => {
    const btn = createDOMNodeFromHTML(`
      <button class="toolbar-item" type="button" id="save-btn" title="Save">
        <img src="/assets/preview/8665513_floppy_disk_icon.svg" />
      </button>
    `)
    btn.addEventListener('click', onSave)
    el.appendChild(btn)
  }

  const addTool = (tool) => {
    if (!(tool instanceof Tool)) {
      throw new Error('Only instances of Tool is accepted.')
    }
    window.debugLog('Toolbar.addTool', tool)
    tools.push(tool)
    insertToolButton(tool)
  }

  const createToolbar = () => {
    const toolbar = createDOMNodeFromHTML(`
      <div id="writ-preview-toolbar"></div>
    `)
    return toolbar
  }

  const tools = []

  const el = createToolbar()
  document.body.appendChild(el)
  insertSaveButton(() => {
    tools.forEach(tool => tool.options.save())
  })

  return Object.freeze({
    el,
    tools,
    addTool
  })
})()

window.Preview = {
  Toolbar,
  Tool,
}
