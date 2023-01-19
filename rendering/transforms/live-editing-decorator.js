const decoratePost = (post) => {
  return {
    ...post,
    title: `
      <span
        data-editable="true"
        data-section="title"
        data-path="${post.path}"
        data-foldered="${post.foldered}"
      >${post.title}</span>
    `,

    content: `
      <div
        data-editable="true"
        data-section="content"
        data-path="${post.path}"
        data-foldered="${post.foldered}"
      >${post.content}</div>
    `
  }
}

const decorateCategory = (category) => {
  return {
    ...category,
    posts: category.posts.map(decoratePost)
  }
}

module.exports = {
  decorateTemplate(mode, template) {
    return template + (mode === 'start' ? '{{> preview }}' : '')
  },

  decorateContent(mode, contentModel) {
    return mode !== 'start' ?
      contentModel :
      {
        ...contentModel,
        posts: contentModel.posts.map(decoratePost),
        categories: contentModel.categories.map(decorateCategory)
      }
  }
}
