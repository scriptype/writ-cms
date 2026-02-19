const homepageTypes = [{
  name: 'BasicHomepage',
  model: 'homepage',
  description: 'A generic landing page',
  attributes: {
    title: 'title',
    description: 'text',
    content: 'content'
  }
}, {
  name: 'FancyHomepage',
  model: 'homepage',
  description: 'A fancy landing page',
  attributes: {
    title: 'title',
    description: 'text',
    content: 'content',
    fancyAttribute: 'date'
  }
}]

const subpageTypes = [{
  name: 'BasicSubpage',
  model: 'subpage',
  description: 'A generic subpage',
  attributes: {
    title: 'title',
    description: 'text',
    content: 'content'
  }
}, {
  name: 'FancySubpage',
  model: 'subpage',
  description: 'A fancy subpage',
  attributes: {
    title: 'title',
    description: 'text',
    content: 'content'
  }
}]

const collectionTypes = [{
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
  name: 'Podcast',
  model: 'collection',
  description: 'A collection of podcast episodes',
  facets: ['tags', 'date', 'guests', 'hosts'],
  collectionAlias: 'podcast',
  categoryContentType: '',
  categoryAlias: '',
  categoriesAlias: '',
  entryContentType: 'PodcastEpisode',
  entryAlias: 'episode',
  entriesAlias: 'episodes',
  attributes: {
    title: 'title',
    description: 'text',
    content: 'content'
  }
}]

const categoryTypes = [{
  name: 'Category',
  model: 'category',
  description: 'A group of entries in a collection',
  attributes: {
    title: 'title',
    description: 'text',
    content: 'content'
  }
}]

const entryTypes = [{
  name: 'BlogPost',
  model: 'entry',
  description: 'Article in a blog',
  attributes: {
    title: 'title',
    tags: 'string[]',
    author: 'Person',
    date: 'date',
    summary: 'text',
    content: 'content',
    coverImage: 'imageAttachment'
  }
}, {
  name: 'PodcastEpisode',
  model: 'entry',
  description: 'An episode of a podcast show',
  attributes: {
    title: 'title',
    tags: 'string[]',
    audioFile: 'attachment:audio',
    transcript: 'attachment:text',
    guests: 'PodcastGuest[]',
    hosts: 'PodcastHost[]'
  }
}, {
  name: 'Person',
  model: 'entry',
  description: 'A person',
  attributes: {
    title: 'title',
    email: 'email',
    bio: 'text',
    avatar: 'image',
  }
}, {
  name: 'Author',
  model: 'entry',
  description: 'An author',
  attributes: {
    title: 'title',
    email: 'email',
    bio: 'text',
    avatar: 'image',
    blogPosts: ['+BlogPost:author']
  }
}, {
  name: 'PodcastHost',
  model: 'entry',
  description: 'A host in a podcast episode',
  attributes: {
    title: 'title',
    email: 'email',
    bio: 'text',
    avatar: 'image',
    hosted: ['+PodcastEpisode:hosts']
  }
}, {
  name: 'PodcastGuest',
  model: 'entry',
  description: 'A guest in a podcast episode',
  attributes: {
    title: 'title',
    email: 'email',
    bio: 'text',
    avatar: 'image',
    hosted: ['+PodcastEpisode:guests']
  }
}]

export default [
  ...homepageTypes,
  ...subpageTypes,
  ...collectionTypes,
  ...categoryTypes,
  ...entryTypes
]
