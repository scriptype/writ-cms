const Post = (post) => {
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
    `,

    summary: `
      <div
        data-editable="true"
        data-section="summary"
        data-path="${post.path}"
        data-foldered="${post.foldered}"
      >${post.summary}</div>
    `
  }
}

const Category = (category) => {
  return {
    ...category,
    posts: category.posts.map(Post)
  }
}

const useContent = (mode) =>
  (contentModel) => {
    if (mode !== 'start') {
      return contentModel
    }
    return {
      ...contentModel,
      posts: contentModel.posts.map(Post),
      categories: contentModel.categories.map(Category)
    }
  }

module.exports = useContent
