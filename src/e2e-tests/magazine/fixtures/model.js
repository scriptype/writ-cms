const FIXTURE_SETTINGS = {
  title: 'Web Magazine'
}

const FIXTURE_CONTENT_MODEL = {
  homepage: {
    title: 'Home',
    date: '2025-11-01',
    content: 'Welcome to E2E Magazine'
  },
  collections: [
    {
      slug: 'articles',
      title: 'articles',
      date: '2025-11-02',
      collectionAlias: 'blog',
      categoryContentType: 'BlogTopic',
      categoryAlias: 'topic',
      categoriesAlias: 'topics',
      entryContentType: 'Article',
      entryAlias: 'article',
      entriesAlias: 'articles',
      facets: ['tags', 'date', 'author', 'resources'],
      content: 'Welcome to articles',
      categories: [
        {
          title: 'Guides',
          slug: 'guides',
          date: '2025-11-03',
          content: '',
          posts: [
            {
              title: 'Hello Design',
              author: { title: 'Mustafa Enes', slug: 'enes' },
              date: '2025-11-05',
              permalink: '/articles/guides/hello-design.html',
              tags: ['ui', 'ux', 'design', 'css'],
              content: 'Design design design',
              context: {
                collection: {
                  title: 'articles',
                  permalink: '/articles'
                },
                categories: [
                  {
                    title: 'Guides',
                    permalink: '/articles/guides'
                  }
                ]
              },
              links: {
                previousPost: {
                  title: 'Introduction to CSS Grid',
                  permalink: '/articles/guides/introduction-to-css-grid.html'
                },
                nextPost: null
              }
            },
            {
              title: 'Introduction to CSS Grid',
              author: { title: 'Mustafa Enes', slug: 'enes' },
              date: '2025-11-06',
              permalink: '/articles/guides/introduction-to-css-grid.html',
              tags: ['css', 'grid', 'art direction', 'design'],
              content: 'All about grid',
              context: {
                collection: {
                  title: 'articles',
                  permalink: '/articles'
                },
                categories: [
                  {
                    title: 'Guides',
                    permalink: '/articles/guides'
                  }
                ]
              },
              links: {
                previousPost: null,
                nextPost: {
                  title: 'Hello Design',
                  permalink: '/articles/guides/hello-design.html'
                }
              }
            }
          ]
        }
      ],
      posts: [
        {
          title: 'Pure JS very good',
          author: { title: 'Sir Tim Berners Lee', slug: 'tim' },
          date: '2025-11-02',
          permalink: '/articles/pure-js-very-good.html',
          tags: ['javascript', 'performance', 'accessibility', 'devx'],
          content: 'pure js very good',
          context: {
            collection: {
              title: 'articles',
              permalink: '/articles'
            },
            categories: []
          },
          links: {
            previousPost: {
              title: 'React bad',
              permalink: '/articles/react-bad.html'
            },
            nextPost: null
          }
        },
        {
          title: 'React bad',
          author: { title: 'Mustafa Enes', slug: 'enes' },
          date: '2025-11-03',
          permalink: '/articles/react-bad.html',
          tags: ['javascript', 'react', 'performance', 'accessibility', 'devx'],
          content: 'react not good',
          context: {
            collection: {
              title: 'articles',
              permalink: '/articles'
            },
            categories: []
          },
          links: {
            previousPost: {
              title: 'Vue good',
              permalink: '/articles/vue-good.html'
            },
            nextPost: {
              title: 'Pure JS very good',
              permalink: '/articles/pure-js-very-good.html'
            }
          }
        },
        {
          title: 'Vue good',
          author: { title: 'Mustafa Enes', slug: 'enes' },
          date: '2025-11-04',
          permalink: '/articles/vue-good.html',
          tags: ['javascript', 'vue', 'performance', 'accessibility', 'devx'],
          content: 'vue good',
          context: {
            collection: {
              title: 'articles',
              permalink: '/articles'
            },
            categories: []
          },
          links: {
            previousPost: null,
            nextPost: {
              title: 'React bad',
              permalink: '/articles/react-bad.html'
            }
          }
        }
      ]
    },
    {
      slug: 'books',
      title: 'books',
      date: '2025-11-04',
      entryContentType: 'Book',
      entryAlias: 'book',
      entriesAlias: 'books',
      facets: ['author', 'date', 'tags', 'genre'],
      content: '',
      categories: [],
      posts: [
        {
          title: 'Football',
          author: { title: 'Sir Alex Ferguson', slug: 'alex' },
          date: '2025-11-04',
          permalink: '/books/football.html',
          genre: 'sports',
          tags: ['Manchester United', 'English football'],
          content: 'Welcome to football.',
          context: {
            collection: {
              title: 'books',
              permalink: '/books'
            },
            categories: []
          },
          links: {
            previousPost: {
              title: 'HTML',
              permalink: '/books/html.html'
            },
            nextPost: null
          }
        },
        {
          title: 'HTML',
          author: { title: 'Sir Tim Berners Lee', slug: 'tim' },
          date: '2025-11-05',
          permalink: '/books/html.html',
          genre: 'technology',
          tags: ['html', 'web', 'internet'],
          content: 'Welcome to hypertext era.',
          context: {
            collection: {
              title: 'books',
              permalink: '/books'
            },
            categories: []
          },
          links: {
            previousPost: null,
            nextPost: {
              title: 'Football',
              permalink: '/books/football.html'
            }
          }
        }
      ]
    },
    {
      slug: 'authors',
      title: 'authors',
      date: '2025-11-05',
      entryContentType: 'Person',
      entryAlias: 'author',
      entriesAlias: 'authors',
      facets: ['events'],
      content: '',
      categories: [],
      posts: [
        {
          title: 'Mustafa Enes',
          slug: 'enes',
          date: '2025-11-05',
          permalink: '/authors/enes.html',
          events: [
            { title: 'Lets HTML now', slug: 'lets-html-now' },
            { title: 'Lets get together', slug: 'lets-get-together' }
          ],
          content: 'Hey, it&#39;s me.',
          context: {
            collection: {
              title: 'authors',
              permalink: '/authors'
            },
            categories: []
          },
          links: {
            previousPost: {
              title: 'Sir Alex Ferguson',
              permalink: '/authors/alex.html'
            },
            nextPost: null
          }
        },
        {
          title: 'Sir Alex Ferguson',
          slug: 'alex',
          date: '2025-11-06',
          permalink: '/authors/alex.html',
          events: [{ title: 'ManU - CFC', slug: 'manu-cfc' }],
          content: 'Chewing a gum.',
          context: {
            collection: {
              title: 'authors',
              permalink: '/authors'
            },
            categories: []
          },
          links: {
            previousPost: {
              title: 'Sir Tim Berners Lee',
              permalink: '/authors/tim.html'
            },
            nextPost: {
              title: 'Mustafa Enes',
              permalink: '/authors/enes.html'
            }
          }
        },
        {
          title: 'Sir Tim Berners Lee',
          slug: 'tim',
          date: '2025-11-07',
          permalink: '/authors/tim.html',
          events: [
            { title: 'Lets HTML now', slug: 'lets-html-now' },
            { title: 'Lets get together', slug: 'lets-get-together' },
            { title: 'What to do', slug: 'what-to-do' }
          ],
          content: '',
          context: {
            collection: {
              title: 'authors',
              permalink: '/authors'
            },
            categories: []
          },
          links: {
            previousPost: null,
            nextPost: {
              title: 'Sir Alex Ferguson',
              permalink: '/authors/alex.html'
            }
          }
        }
      ]
    },
    {
      slug: 'demos',
      title: 'demos',
      date: '2025-11-06',
      contentType: 'DemoPortfolio',
      categoryContentType: 'Technology',
      entryContentType: 'Demo',
      categoryAlias: 'technology',
      categoriesAlias: 'technologies',
      entryAlias: 'demo',
      entriesAlias: 'demos',
      facets: ['tags', 'date', 'maker'],
      content: '<h1 id="good-luck-running-these">Good luck running these</h1>',
      categories: [
        {
          slug: 'css',
          title: 'Cascade all the way',
          date: '2025-11-07',
          categoryContentType: 'Technique',
          categoryAlias: 'technique',
          categoriesAlias: 'techniques',
          content: '<h1 id="welcome-to-cascade">Welcome to cascade</h1>',
          categories: [
            {
              title: 'CSS Art',
              slug: 'css-art',
              date: '2025-11-08',
              content: '',
              posts: [
                {
                  title: 'Carpet Motifs',
                  maker: { title: 'Mustafa Enes', slug: 'enes' },
                  date: '2025-11-11',
                  permalink: '/demos/css/css-art/carpet-motifs',
                  tags: ['css', 'art'],
                  content: 'Carpet shapes',
                  context: {
                    collection: {
                      title: 'demos',
                      permalink: '/demos'
                    },
                    categories: [
                      {
                        title: 'Cascade all the way',
                        permalink: '/demos/css'
                      },
                      {
                        title: 'CSS Art',
                        permalink: '/demos/css/css-art'
                      }
                    ]
                  },
                  links: {
                    previousPost: {
                      title: 'Realist Painting',
                      permalink: '/demos/css/css-art/realist-painting.html'
                    },
                    nextPost: null
                  }
                },
                {
                  title: 'Realist Painting',
                  maker: { title: 'Mustafa Enes', slug: 'enes' },
                  date: '2025-11-12',
                  permalink: '/demos/css/css-art/realist-painting.html',
                  tags: ['css', 'art', 'painting'],
                  content: 'A lot of css',
                  context: {
                    collection: {
                      title: 'demos',
                      permalink: '/demos'
                    },
                    categories: [
                      {
                        title: 'Cascade all the way',
                        permalink: '/demos/css'
                      },
                      {
                        title: 'CSS Art',
                        permalink: '/demos/css/css-art'
                      }
                    ]
                  },
                  links: {
                    previousPost: {
                      title: 'Grid vs Flexbox',
                      permalink: '/demos/css/grid/grid-vs-flexbox'
                    },
                    nextPost: {
                      title: 'Carpet Motifs',
                      permalink: '/demos/css/css-art/carpet-motifs'
                    }
                  }
                }
              ]
            },
            {
              title: 'Grid',
              slug: 'grid',
              date: '2025-11-09',
              content: '',
              posts: [
                {
                  title: 'Grid vs Flexbox',
                  maker: { title: 'Mustafa Enes', slug: 'enes' },
                  date: '2025-11-10',
                  permalink: '/demos/css/grid/grid-vs-flexbox',
                  tags: ['css', 'grid', 'flex', 'layout'],
                  content: 'A versus',
                  context: {
                    collection: {
                      title: 'demos',
                      permalink: '/demos'
                    },
                    categories: [
                      {
                        title: 'Cascade all the way',
                        permalink: '/demos/css'
                      },
                      {
                        title: 'Grid',
                        permalink: '/demos/css/grid'
                      }
                    ]
                  },
                  links: {
                    previousPost: {
                      title: 'Hello Grid',
                      permalink: '/demos/css/grid/hello-grid.html'
                    },
                    nextPost: {
                      title: 'Realist Painting',
                      permalink: '/demos/css/css-art/realist-painting.html'
                    }
                  }
                },
                {
                  title: 'Hello Grid',
                  maker: { title: 'Sir Tim Berners Lee', slug: 'tim' },
                  date: '2025-11-09',
                  permalink: '/demos/css/grid/hello-grid.html',
                  tags: ['css', 'layout', 'grid'],
                  content: 'let there be grid',
                  context: {
                    collection: {
                      title: 'demos',
                      slug: 'demos',
                      permalink: '/demos'
                    },
                    categories: [
                      {
                        title: 'Cascade all the way',
                        slug: 'css',
                        permalink: '/demos/css'
                      },
                      {
                        title: 'Grid',
                        slug: 'grid',
                        permalink: '/demos/css/grid'
                      }
                    ]
                  },
                  links: {
                    previousPost: {
                      title: 'Hello CSS',
                      permalink: '/demos/css/hello-css.html'
                    },
                    nextPost: {
                      title: 'Grid vs Flexbox',
                      permalink: '/demos/css/grid/grid-vs-flexbox'
                    }
                  }
                }
              ]
            }
          ],
          posts: [
            {
              title: 'Hello CSS',
              maker: { title: 'Sir Tim Berners Lee', slug: 'tim' },
              date: '2025-11-08',
              permalink: '/demos/css/hello-css.html',
              tags: ['css', 'tutorial'],
              content: 'there is css',
              context: {
                collection: {
                  title: 'demos',
                  permalink: '/demos'
                },
                categories: [
                  {
                    title: 'Cascade all the way',
                    permalink: '/demos/css'
                  }
                ]
              },
              links: {
                previousPost: null,
                nextPost: {
                  title: 'Hello Grid',
                  permalink: '/demos/css/grid/hello-grid.html'
                }
              }
            }
          ]
        },
        {
          slug: 'threejs',
          title: 'Not one and not two, it\'s three',
          date: '2025-11-10',
          categoryContentType: 'Technique',
          categoryAlias: 'technique',
          categoriesAlias: 'techniques',
          content: '<h1>Welcome to three stuff</h1>',
          categories: [
            {
              title: 'Sprite',
              slug: 'sprite',
              date: '2025-11-11',
              content: '',
              posts: [
                {
                  title: 'Minesweeper',
                  maker: { title: 'Mustafa Enes', slug: 'enes' },
                  date: '2025-11-10',
                  permalink: '/demos/threejs/sprite/minesweeper',
                  tags: ['game'],
                  content: 'A Classic',
                  context: {
                    collection: {
                      title: 'demos',
                      permalink: '/demos'
                    },
                    categories: [
                      {
                        title: "Not one and not two, it's three",
                        permalink: '/demos/threejs'
                      },
                      {
                        title: 'Sprite',
                        permalink: '/demos/threejs/sprite'
                      }
                    ]
                  },
                  links: {
                    previousPost: {
                      title: 'Stickman',
                      permalink: '/demos/threejs/sprite/stickman.html'
                    },
                    nextPost: {
                      title: 'Simple 3D',
                      permalink: '/demos/threejs/simple-3d.html'
                    }
                  }
                },
                {
                  title: 'Stickman',
                  maker: { title: 'Mustafa Enes', slug: 'enes' },
                  date: '2025-11-11',
                  permalink: '/demos/threejs/sprite/stickman.html',
                  tags: ['game'],
                  content: 'stickman demo',
                  context: {
                    collection: {
                      title: 'demos',
                      permalink: '/demos'
                    },
                    categories: [
                      {
                        title: "Not one and not two, it's three",
                        permalink: '/demos/threejs'
                      },
                      {
                        title: 'Sprite',
                        permalink: '/demos/threejs/sprite'
                      }
                    ]
                  },
                  links: {
                    previousPost: {
                      title: 'Ipsum demo',
                      permalink: '/demos/threejs/webgpu/ipsum-demo.html'
                    },
                    nextPost: {
                      title: 'Minesweeper',
                      permalink: '/demos/threejs/sprite/minesweeper'
                    }
                  }
                }
              ]
            },
            {
              title: 'WebGPU',
              slug: 'webgpu',
              date: '2025-11-12',
              content: '',
              posts: [
                {
                  title: 'Ipsum demo',
                  date: '2025-11-12',
                  permalink: '/demos/threejs/webgpu/ipsum-demo.html',
                  content: '',
                  context: {
                    collection: {
                      title: 'demos',
                      permalink: '/demos'
                    },
                    categories: [
                      {
                        title: "Not one and not two, it's three",
                        permalink: '/demos/threejs'
                      },
                      {
                        title: 'WebGPU',
                        permalink: '/demos/threejs/webgpu'
                      }
                    ]
                  },
                  links: {
                    previousPost: {
                      title: 'Lorem Demo',
                      permalink: '/demos/threejs/webgpu/lorem-demo'
                    },
                    nextPost: {
                      title: 'Stickman',
                      permalink: '/demos/threejs/sprite/stickman.html'
                    }
                  }
                },
                {
                  title: 'Lorem Demo',
                  date: '2025-11-13',
                  permalink: '/demos/threejs/webgpu/lorem-demo',
                  content: '',
                  context: {
                    collection: {
                      title: 'demos',
                      permalink: '/demos'
                    },
                    categories: [
                      {
                        title: "Not one and not two, it's three",
                        slug: 'threejs',
                        permalink: '/demos/threejs'
                      },
                      {
                        title: 'WebGPU',
                        slug: 'webgpu',
                        permalink: '/demos/threejs/webgpu'
                      }
                    ]
                  },
                  links: {
                    previousPost: null,
                    nextPost: {
                      title: 'Ipsum demo',
                      permalink: '/demos/threejs/webgpu/ipsum-demo.html'
                    }
                  }
                }
              ]
            }
          ],
          posts: [
            {
              title: 'Intelligent Drum n Bass',
              maker: { title: 'Mustafa Enes', slug: 'enes' },
              date: '2025-11-08',
              permalink: '/demos/threejs/intelligent-drum-n-bass',
              tags: ['reproduction', 'music', 'cars', 'visual effects'],
              content: 'Impala on the F ring',
              context: {
                collection: {
                  title: 'demos',
                  permalink: '/demos'
                },
                categories: [
                  {
                    title: "Not one and not two, it's three",
                    permalink: '/demos/threejs'
                  }
                ]
              },
              links: {
                previousPost: {
                  title: 'Simple 3D',
                  permalink: '/demos/threejs/simple-3d.html'
                },
                nextPost: null
              }
            },
            {
              title: 'Simple 3D',
              maker: { title: 'Sir Tim Berners Lee', slug: 'tim' },
              date: '2025-11-09',
              permalink: '/demos/threejs/simple-3d.html',
              content: 'Some simple 3d demo',
              context: {
                collection: {
                  title: 'demos',
                  permalink: '/demos'
                },
                categories: [
                  {
                    title: "Not one and not two, it's three",
                    permalink: '/demos/threejs'
                  }
                ]
              },
              links: {
                previousPost: {
                  title: 'Minesweeper',
                  permalink: '/demos/threejs/sprite/minesweeper'
                },
                nextPost: {
                  title: 'Intelligent Drum n Bass',
                  permalink: '/demos/threejs/intelligent-drum-n-bass'
                }
              }
            }
          ]
        }
      ],
      posts: [
        {
          title: 'Hello World',
          maker: { title: 'Mustafa Enes', slug: 'enes' },
          date: '2025-11-06',
          permalink: '/demos/hello-world',
          tags: ['html', 'hello world'],
          content: '<h1>Hello world</h1>\n\n<p>Elit dolorum iure porro optio vel eveniet Quos labore ab deleniti labore asperiores. Blanditiis magni suscipit hic ut delectus Libero atque porro harum cum tempora Ullam culpa distinctio dignissimos ex.</p>',
          context: {
            collection: {
              title: 'demos',
              permalink: '/demos'
            },
            categories: []
          },
          links: {
            previousPost: {
              title: 'good-morning-world',
              permalink: '/demos/good-morning-world.html'
            },
            nextPost: null
          }
        },
        {
          title: 'good-morning-world',
          maker: { title: 'Sir Tim Berners Lee', slug: 'tim' },
          date: '2025-11-07',
          permalink: '/demos/good-morning-world.html',
          tags: ['html', 'attributes', 'good morning'],
          content: '<h1>Good morning world</h1>\n\n<p align="center">Elit dolorum iure porro optio vel eveniet Quos labore ab deleniti labore asperiores. Blanditiis magni suscipit hic ut delectus Libero atque porro harum cum tempora Ullam culpa distinctio dignissimos ex.</p>',
          context: {
            collection: {
              title: 'demos',
              permalink: '/demos'
            },
            categories: []
          },
          links: {
            previousPost: null,
            nextPost: {
              title: 'Hello World',
              permalink: '/demos/hello-world'
            }
          }
        }
      ]
    },
    {
      slug: 'events',
      title: 'events',
      date: '2025-11-13',
      entryContentType: 'Event',
      facets: ['lorem', 'ipsum', 'dolor'],
      content: '',
      categories: [],
      posts: [
        {
          title: 'Lets HTML now',
          date: '2023-11-13',
          permalink: '/events/lets-html-now.html',
          organizers: [{ title: 'Sir Tim Berners Lee', slug: 'tim' }],
          participants: [{ title: 'Mustafa Enes', slug: 'enes' }],
          content: 'html good',
          context: {
            collection: {
              title: 'events',
              permalink: '/events'
            },
            categories: []
          },
          links: {
            previousPost: {
              title: 'Lets get together',
              permalink: '/events/lets-get-together.html'
            },
            nextPost: null
          }
        },
        {
          title: 'Lets get together',
          date: '2024-11-13',
          permalink: '/events/lets-get-together.html',
          organizers: [
            { title: 'Mustafa Enes', slug: 'enes' },
            { title: 'Sir Tim Berners Lee', slug: 'tim' }
          ],
          content: 'And call it an event',
          context: {
            collection: {
              title: 'events',
              permalink: '/events'
            },
            categories: []
          },
          links: {
            previousPost: {
              title: 'ManU - CFC',
              permalink: '/events/manu-cfc.html'
            },
            nextPost: {
              title: 'Lets HTML now',
              permalink: '/events/lets-html-now.html'
            }
          }
        },
        {
          title: 'ManU - CFC',
          date: '2025-11-13',
          permalink: '/events/manu-cfc.html',
          participants: [{ title: 'Sir Alex Ferguson', slug: 'alex' }],
          content: '',
          context: {
            collection: {
              title: 'events',
              permalink: '/events'
            },
            categories: []
          },
          links: {
            previousPost: {
              title: 'What to do',
              permalink: '/events/what-to-do.html'
            },
            nextPost: {
              title: 'Lets get together',
              permalink: '/events/lets-get-together.html'
            }
          }
        },
        {
          title: 'What to do',
          date: '2025-11-18',
          permalink: '/events/what-to-do.html',
          participants: [{ title: 'Sir Tim Berners Lee', slug: 'tim' }],
          content: '',
          context: {
            collection: {
              title: 'events',
              permalink: '/events'
            },
            categories: []
          },
          links: {
            previousPost: null,
            nextPost: {
              title: 'ManU - CFC',
              permalink: '/events/manu-cfc.html'
            }
          }
        }
      ]
    }
  ],
  subpages: [
    {
      title: 'About us',
      permalink: '/about-us.html',
      date: '2025-11-14',
      content: 'Something about us'
    },
    {
      title: 'Hear from us all the time',
      permalink: '/newsletter.html',
      date: '2025-11-16',
      content: 'Sign up now'
    }
  ]
}

module.exports = {
  FIXTURE_SETTINGS,
  FIXTURE_CONTENT_MODEL
}
