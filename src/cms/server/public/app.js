import getSettings from './getSettings.js'
import updateSettings from './updateSettings.js'
import getFileSystemTree from './getFileSystemTree.js'
import getContentModel from './getContentModel.js'
import getCategories from './getCategories.js'
import getCategory from './getCategory.js'
import createCategory from './createCategory.js'
import getPosts from './getPosts.js'
import getPost from './getPost.js'
import createPost from './createPost.js'
import getSubpages from './getSubpages.js'
import getSubpage from './getSubpage.js'
import createSubpage from './createSubpage.js'

const query = document.querySelector.bind(document)

const makeButtonsWork = () => {
  query('#get-settings-btn').addEventListener('click', getSettings)
  query('#update-settings-btn').addEventListener('click', updateSettings)
  query('#get-file-system-tree-btn').addEventListener('click', getFileSystemTree)
  query('#get-content-model-btn').addEventListener('click', getContentModel)
  query('#get-categories-btn').addEventListener('click', getCategories)
  query('#get-category-btn').addEventListener('click', getCategory)
  query('#create-category-btn').addEventListener('click', createCategory)
  query('#get-posts-btn').addEventListener('click', getPosts)
  query('#get-post-btn').addEventListener('click', getPost)
  query('#create-post-btn').addEventListener('click', createPost)
  query('#get-subpages-btn').addEventListener('click', getSubpages)
  query('#get-subpage-btn').addEventListener('click', getSubpage)
  query('#create-subpage-btn').addEventListener('click', createSubpage)
}

const setIframeSrc = () => {
  const { hostname } = window.location
  query('#preview').src = `http://${hostname}:3000`
}

window.addEventListener('DOMContentLoaded', () => {
  setIframeSrc()
  makeButtonsWork()
})
