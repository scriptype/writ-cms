import { query, createDOMNodeFromHTML, setIframeSrc } from './common.js'
import ssgBuild from './explorePanel/ssgBuild.js'
import ssgWatch from './explorePanel/ssgWatch.js'
import ssgStopWatcher from './explorePanel/ssgStopWatcher.js'
import getSSGOptions from './explorePanel/getSSGOptions.js'
import getSettings from './explorePanel/getSettings.js'
import updateSettings from './explorePanel/updateSettings.js'
import getContentTypes from './explorePanel/getContentTypes.js'
import createContentType from './explorePanel/createContentType.js'
import getContentModel from './explorePanel/getContentModel.js'
import getFileSystemTree from './explorePanel/getFileSystemTree.js'
import getCollections from './explorePanel/getCollections.js'
import getSubpages from './explorePanel/getSubpages.js'
import getSubpage from './explorePanel/getSubpage.js'
import createSubpage from './explorePanel/createSubpage.js'
import getHomepage from './explorePanel/getHomepage.js'
import createHomepage from './explorePanel/createHomepage.js'

const template = () => {
  return `
    <div class="panel explore-panel collapsed">
      <p>ssg</p>
      <button type="button" id="ssg-build-btn">ssg.build()</button>
      <button type="button" id="ssg-watch-btn">ssg.watch()</button>
      <button type="button" id="ssg-stop-watcher-btn">ssg.stopWatcher()</button>
      <button type="button" id="get-ssg-options-btn">get ssg options</button>

      <p>settings</p>
      <button type="button" id="get-settings-btn">get settings</button>
      <button type="button" id="update-settings-btn">update settings</button>

      <p>contentTypes</p>
      <button type="button" id="get-content-types-btn">get contentTypes</button>
      <button type="button" id="create-content-type-btn">create contentType</button>

      <p>contentModel</p>
      <button type="button" id="get-content-model-btn">get contentModel</button>

      <p>fileSystemTree</p>
      <button type="button" id="get-file-system-tree-btn">get fileSystemTree</button>

      <p>collections</p>
      <button type="button" id="get-collections-btn">get all collections</button>

      <p>homepage</p>
      <button type="button" id="get-homepage-btn">get homepage</button>
      <button type="button" id="create-homepage-btn">create homepage</button>

      <p>subpages</p>
      <button type="button" id="get-subpages-btn">get all subpages</button>
      <button type="button" id="get-subpage-btn">get subpage</button>
      <button type="button" id="create-subpage-btn">create subpage</button>
    </div>
  `
}

const makeButtonsWork = (panel) => {
  panel.querySelector('#ssg-build-btn').addEventListener('click', async () => {
    await ssgBuild()
    setIframeSrc()
  })
  panel.querySelector('#ssg-watch-btn').addEventListener('click', async () => {
    await ssgWatch()
    setIframeSrc()
  })
  panel.querySelector('#ssg-stop-watcher-btn').addEventListener('click', async () => {
    await ssgStopWatcher()
    setIframeSrc()
  })
  panel.querySelector('#get-ssg-options-btn').addEventListener('click', getSSGOptions)
  panel.querySelector('#get-settings-btn').addEventListener('click', getSettings)
  panel.querySelector('#update-settings-btn').addEventListener('click', updateSettings)
  panel.querySelector('#get-content-types-btn').addEventListener('click', getContentTypes)
  panel.querySelector('#create-content-type-btn').addEventListener('click', createContentType)
  panel.querySelector('#get-content-model-btn').addEventListener('click', getContentModel)
  panel.querySelector('#get-file-system-tree-btn').addEventListener('click', getFileSystemTree)
  panel.querySelector('#get-collections-btn').addEventListener('click', getCollections)
  panel.querySelector('#get-subpages-btn').addEventListener('click', getSubpages)
  panel.querySelector('#get-subpage-btn').addEventListener('click', getSubpage)
  panel.querySelector('#create-subpage-btn').addEventListener('click', createSubpage)
  panel.querySelector('#get-homepage-btn').addEventListener('click', getHomepage)
  panel.querySelector('#create-homepage-btn').addEventListener('click', createHomepage)
}

const makeDraggable = (element) => {
  let offsetX = 0
  let offsetY = 0
  let targetX = 0
  let targetY = 0
  let currentX = 0
  let currentY = 0
  let animationId = null
  let isDragging = false
  const easing = 0.125

  const animate = () => {
    currentX += (targetX - currentX) * easing
    currentY += (targetY - currentY) * easing
    element.style.left = currentX + 'px'
    element.style.top = currentY + 'px'

    if (!isDragging) {
      const distance = Math.abs(targetX - currentX) + Math.abs(targetY - currentY)
      if (distance < 0.1) {
        animationId = null
        return
      }
    }

    animationId = requestAnimationFrame(animate)
  }

  element.addEventListener('pointerdown', (e) => {
    if (e.target !== element && e.target.closest('button, input, a')) {
      return
    }

    isDragging = true

    if (!animationId) {
      animationId = requestAnimationFrame(animate)
    }

    offsetX = e.clientX - currentX
    offsetY = e.clientY - currentY
    element.setPointerCapture(e.pointerId)

    const move = (e) => {
      targetX = e.clientX - offsetX
      targetY = e.clientY - offsetY
    }

    const stop = () => {
      element.removeEventListener('pointermove', move)
      element.removeEventListener('pointerup', stop)
      isDragging = false
    }

    element.addEventListener('pointermove', move)
    element.addEventListener('pointerup', stop)
  })
}

const makeCollapsible = (element) => {
  element.addEventListener('dblclick', () => {
    element.classList.toggle('collapsed')
  })
}

window.addEventListener('DOMContentLoaded', () => {
  const explorePanel = createDOMNodeFromHTML(template())
  makeButtonsWork(explorePanel)
  makeDraggable(explorePanel)
  makeCollapsible(explorePanel)

  const container = query('#panels-container')
  container.appendChild(explorePanel)
})
