import { createDOMNodeFromHTML } from '../../common.js'
import api from '../../../api.js'
import Dialog from '../Dialog.js'
import defaultContentTypes from '../../defaultContentTypes.js'
import { flattenSubtree } from './contentTree.js'
import { template } from './template.js'

const INITIAL_CONTENT_TYPES_SHOWN = 5

const state = {
  tree: [],
  path: [],
  showAllTypes: false
}

const resolveNodes = () => {
  let nodes = state.tree
  for (const step of state.path) {
    nodes = nodes[step.index].children || []
  }
  return nodes
}

const getBreadcrumb = () => {
  return ['Content', ...state.path.map(step => step.name)]
    .join(' › ')
}

const getVisibleContentTypes = () => {
  if (state.showAllTypes) {
    return defaultContentTypes
  }
  const entryTypes = defaultContentTypes.filter(
    contentType => contentType.model === 'entry'
  )
  return entryTypes.slice(0, INITIAL_CONTENT_TYPES_SHOWN)
}

const addListeners = ($panel, nodes) => {
  const $back = $panel.querySelector('.content-panel-back-btn')
  if ($back) {
    $back.addEventListener('click', () => {
      state.path.pop()
      update()
    })
  }

  $panel.querySelectorAll('[data-drill]').forEach($el => {
    $el.addEventListener('click', () => {
      const i = parseInt($el.dataset.drill, 10)
      state.path.push({ index: i, name: nodes[i].name })
      update()
    })
  })

  $panel.querySelectorAll('[data-edit]').forEach($btn => {
    $btn.addEventListener('click', () => {
      const i = parseInt($btn.dataset.edit, 10)
      const node = nodes[i]
      console.log(
        'Route to edit:', node.type, node.name,
        node.data
      )
    })
  })

  $panel.querySelectorAll('[data-delete]').forEach($btn => {
    $btn.addEventListener('click', () => {
      const i = parseInt($btn.dataset.delete, 10)
      const node = nodes[i]
      console.log(
        'Route to delete:', node.type, node.name,
        node.data
      )
    })
  })

  $panel.querySelectorAll('[data-create-type]').forEach($btn => {
    $btn.addEventListener('click', () => {
      console.log(
        'Route to create:',
        $btn.dataset.createType,
        'at', getBreadcrumb()
      )
    })
  })

  const $expand = $panel.querySelector('.content-panel-expand-btn')
  if ($expand) {
    $expand.addEventListener('click', () => {
      state.showAllTypes = true
      update()
    })
  }
}

const render = async () => {
  Dialog.textContent('Loading…').show()

  const contentModel = await api.contentModel.get()
  state.tree = flattenSubtree(contentModel)
  state.path = []
  state.showAllTypes = false

  update()
}

const update = () => {
  const nodes = resolveNodes()
  const visibleContentTypes = getVisibleContentTypes()
  const html = template({
    breadcrumb: getBreadcrumb(),
    nodes,
    showBack: state.path.length > 0,
    visibleContentTypes,
    canExpand: visibleContentTypes.length <
      defaultContentTypes.length
  })
  const $panel = createDOMNodeFromHTML(html)
  addListeners($panel, nodes)
  Dialog.html('')
  Dialog.appendChild($panel)
}

export default { render }