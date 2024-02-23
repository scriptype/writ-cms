import getSettings from './api/getSettings.js'
import updateSettings from './api/updateSettings.js'
import getFileSystemTree from './api/getFileSystemTree.js'
import getContentModel from './api/getContentModel.js'
import getCategories from './api/getCategories.js'
import getCategory from './api/getCategory.js'
import createCategory from './api/createCategory.js'
import getPosts from './api/getPosts.js'
import getPost from './api/getPost.js'
import createPost from './api/createPost.js'
import getSubpages from './api/getSubpages.js'
import getSubpage from './api/getSubpage.js'
import createSubpage from './api/createSubpage.js'
import getHomepage from './api/getHomepage.js'
import createHomepage from './api/createHomepage.js'
import getTags from './api/getTags.js'
import getTag from './api/getTag.js'

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
  query('#get-homepage-btn').addEventListener('click', getHomepage)
  query('#create-homepage-btn').addEventListener('click', createHomepage)
  query('#get-tags-btn').addEventListener('click', getTags)
  query('#get-tag-btn').addEventListener('click', getTag)
}

const setIframeSrc = () => {
  const { hostname } = window.location
  query('#preview').src = `http://${hostname}:3000`
}

window.addEventListener('DOMContentLoaded', () => {
  setIframeSrc()
  makeButtonsWork()
})
