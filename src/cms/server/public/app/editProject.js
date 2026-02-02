import api from '../api.js'
import { setIframeSrc } from './common.js'
import dialog from './components/dialog.js'
import selectContentTypesForm from './components/selectContentTypesForm.js'

const defaultContentTypes = [{
  name: 'Homepage',
  model: 'homepage',
  description: 'A generic landing page',
  attributes: {
    title: 'title',
    description: 'text',
    content: 'content'
  }
}, {
  name: 'Subpage',
  model: 'subpage',
  description: 'A generic subpage',
  attributes: {
    title: 'title',
    description: 'text',
    content: 'content'
  }
}, {
  name: 'Blog',
  model: 'collection',
  description: 'A collection of blog posts',
  facets: ['tags', 'date', 'author'],
  collectionAlias: 'blog',
  categoryContentType: '',
  categoryAlias: '',
  categoriesAlias: '',
  entryContentType: 'BlogPost',
  entryAlias: 'post',
  entriesAlias: 'posts',
  attributes: {
    title: 'title',
    description: 'text',
    content: 'content'
  }
}, {
  name: 'Category',
  model: 'category',
  description: 'A group of entries in a collection',
  attributes: {
    title: 'title',
    description: 'text',
    content: 'content'
  }
}, {
  name: 'BlogPost',
  model: 'entry',
  description: 'Article in a blog',
  attributes: {
    title: 'title',
    tags: 'strings',
    author: 'Person',
    date: 'date',
    summary: 'text',
    content: 'content',
    coverImage: 'imageAttachment'
  }
}, {
  name: 'Person',
  model: 'entry',
  description: 'A person',
  attributes: {
    title: 'title',
    email: 'email',
    bio: 'text',
    blogPosts: ['+BlogPost:author']
  }
}]


const editProject = async ({ ssgOptions }) => {
  console.log('starting editor with ssgOptions', ssgOptions)
  await api.ssg.watch(ssgOptions)
  setIframeSrc()

  const contentTypes = await api.contentTypes.get()
  if (contentTypes.length) {
    return console.log('contentTypes', contentTypes)
  }
  console.log('no contentTypes')
  const { $el: $contentTypeForm } = selectContentTypesForm({
    defaultContentTypes,
    onSubmit: (selectedContentTypes) => {
      console.log('selectedContentTypes', selectedContentTypes)
      selectedContentTypes.forEach(async contentType => {
        await api.contentTypes.create(contentType)
      })
      dialog.hide()
    }
  })
  dialog
    .appendChild($contentTypeForm)
    .show()
}

export default editProject
