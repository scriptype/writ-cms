import ssgBuild from './app/ssgBuild.js'
import ssgWatch from './app/ssgWatch.js'
import getSSGOptions from './app/getSSGOptions.js'
import getSettings from './app/getSettings.js'
import updateSettings from './app/updateSettings.js'
import getFileSystemTree from './app/getFileSystemTree.js'
import getContentModel from './app/getContentModel.js'
import getCollections from './app/getCollections.js'
import getCategories from './app/getCategories.js'
import getCategory from './app/getCategory.js'
import createCategory from './app/createCategory.js'
import getPosts from './app/getPosts.js'
import getPost from './app/getPost.js'
import createPost from './app/createPost.js'
import getSubpages from './app/getSubpages.js'
import getSubpage from './app/getSubpage.js'
import createSubpage from './app/createSubpage.js'
import getHomepage from './app/getHomepage.js'
import createHomepage from './app/createHomepage.js'
import getTags from './app/getTags.js'
import getTag from './app/getTag.js'

const query = document.querySelector.bind(document)

const makeButtonsWork = () => {
  query('#ssg-build-btn').addEventListener('click', async () => {
    await ssgBuild()
    setIframeSrc()
  })
  query('#ssg-watch-btn').addEventListener('click', async () => {
    await ssgWatch()
    setIframeSrc()
  })
  query('#get-ssg-options-btn').addEventListener('click', getSSGOptions)
  query('#get-settings-btn').addEventListener('click', getSettings)
  query('#update-settings-btn').addEventListener('click', updateSettings)
  query('#get-file-system-tree-btn').addEventListener('click', getFileSystemTree)
  query('#get-content-model-btn').addEventListener('click', getContentModel)
  query('#get-collections-btn').addEventListener('click', getCollections)
  query('#get-categories-btn').addEventListener('click', getCategories)
  query('#get-category-btn').addEventListener('click', getCategory)
  query('#create-category-btn').addEventListener('click', createCategory)
  query('#get-posts-btn').addEventListener('click', getPosts)
  query('#get-post-btn').addEventListener('click', getPost)
  query('#create-post-btn').addEventListener('click', createPost)
  query('#get-subpages-btn').addEventListener('click', getSubpages)
  query('#get-subpage-btn').addEventListener('click', getSubpage)
  query('#create-subpage-btn').addEventListener('click', createSubpage)
  query('#get-homepage-btn').addEventListener('click', getHomepage)
  query('#create-homepage-btn').addEventListener('click', createHomepage)
  query('#get-tags-btn').addEventListener('click', getTags)
  query('#get-tag-btn').addEventListener('click', getTag)
}

const setIframeSrc = () => {
  const { hostname } = window.location
  query('#preview').src = `http://${hostname}:3000`
}

const makeDraggable = (element) => {
  let offsetX = 0
  let offsetY = 0

  element.addEventListener('mousedown', (e) => {
    offsetX = e.clientX - element.offsetLeft
    offsetY = e.clientY - element.offsetTop

    const move = (e) => {
      element.style.left = (e.clientX - offsetX) + 'px'
      element.style.top = (e.clientY - offsetY) + 'px'
    }

    const stop = () => {
      document.removeEventListener('mousemove', move)
      document.removeEventListener('mouseup', stop)
    }

    document.addEventListener('mousemove', move)
    document.addEventListener('mouseup', stop)
  })
}

window.addEventListener('DOMContentLoaded', () => {
  setIframeSrc()
  makeButtonsWork()
  makeDraggable(document.querySelector('.explore-panel'))
})
