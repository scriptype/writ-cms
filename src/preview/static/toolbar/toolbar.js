import createSaveTool from './primary-actions/save.js'
import Tool from './tool.js'
import PrimaryAction from './primary-action.js'

let tools = []
let primaryActions = []
let el = null

const createDOMNodeFromHTML = (html) => {
  const el = document.createElement('div')
  el.innerHTML = html
  return el.firstElementChild
}

const createToolbar = () => {
  const toolbar = createDOMNodeFromHTML(`
    <div class="writ-toolbar">
      <div class="writ-toolbar-content">
        <div class="writ-toolbar-tool-group"></div>
        <div class="writ-toolbar-tool-group"></div>
      </div>
    </div>
  `)
  return toolbar
}

const createToolButton = async (tool) => {
  const id = tool.get('id')
  const label = tool.get('label')
  const content = await tool.content()
  const toolButton = createDOMNodeFromHTML(`
    <button type="button" class="writ-toolbar-item tool-btn" data-tool-id="${id}" title="${label}">
      ${content}
    </button>
  `)

  toolButton.addEventListener('click', tool.onClick.bind(tool))
  return toolButton
}

const createToolToggle = async (tool) => {
  const id = tool.get('id')
  const label = tool.get('label')
  const content = await tool.content()
  const toolToggle = createDOMNodeFromHTML(`
    <div class="writ-toolbar-item tool-btn" data-tool-id="${id}" title="${label}">
      <input type="checkbox" id="tool-btn-${id}" />
      <label for="tool-btn-${id}">${content}</label>
    </div>
  `)

  toolToggle.addEventListener('change', (event) => {
    if (event.target.checked) {
      tool.activate()
    } else {
      tool.deactivate()
    }
  })

  return toolToggle
}

const addTool = async (tool) => {
  if (!(tool instanceof Tool)) {
    throw new Error('Only Tool instances are accepted.')
  }
  window.debugLog('Toolbar.addTool', tool)
  tools.push(tool)
  const toolbarItem = await createToolToggle(tool)
  el.querySelector('.writ-toolbar-tool-group:nth-child(2)').appendChild(toolbarItem)
}

const addPrimaryAction = async (primaryAction) => {
  if (!(primaryAction instanceof PrimaryAction)) {
    throw new Error('Only PrimaryAction instances are accepted.')
  }
  window.debugLog('Toolbar.addPrimaryAction', primaryAction)
  primaryActions.push(primaryAction)
  const toolbarItem = await createToolButton(primaryAction)
  el.querySelector('.writ-toolbar-tool-group').appendChild(toolbarItem)
}

const init = async () => {
  tools = []
  el = createToolbar()
  document.body.appendChild(el)
  addPrimaryAction(await createSaveTool())
}

const getTools = () => {
  return tools
}

export default Object.freeze({
  el,
  getTools,
  addTool,
  init
})
