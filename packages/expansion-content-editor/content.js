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
    `
  }
}

const Category = (category) => {
  return {
    ...category,
    posts: category.posts.map(Post)
  }
}

module.exports = {
  Post,
  Category
}
