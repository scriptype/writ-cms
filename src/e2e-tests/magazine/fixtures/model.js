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
          contentType: 'BlogTopic',
          content: '',
          categories: [],
          posts: [
            {
              title: 'Hello Design',
              author: { title: 'Mustafa Enes', slug: 'enes' },
              date: '2025-11-05',
              permalink: '/articles/guides/hello-design.html',
              contentType: 'Article',
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
                previousPost: null,
                nextPost: {
                  title: 'Introduction to CSS Grid',
                  permalink: '/articles/guides/introduction-to-css-grid.html'
                }
              }
            },
            {
              title: 'Introduction to CSS Grid',
              author: { title: 'Mustafa Enes', slug: 'enes' },
              date: '2025-11-06',
              permalink: '/articles/guides/introduction-to-css-grid.html',
              contentType: 'Article',
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
                previousPost: {
                  title: 'Hello Design',
                  permalink: '/articles/guides/hello-design.html'
                },
                nextPost: null
              }
            }
          ]
        },
        {
          title: '',
          isDefaultCategory: true,
          date: '2025-11-02',
          contentType: 'BlogTopic',
          content: '',
          categories: [],
          posts: [
            {
              title: 'Pure JS very good',
              author: { title: 'Sir Tim Berners Lee', slug: 'tim' },
              date: '2025-11-02',
              permalink: '/articles/pure-js-very-good.html',
              contentType: 'Article',
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
                previousPost: null,
                nextPost: {
                  title: 'React bad',
                  permalink: '/articles/react-bad.html'
                }
              }
            },
            {
              title: 'React bad',
              author: { title: 'Mustafa Enes', slug: 'enes' },
              date: '2025-11-03',
              permalink: '/articles/react-bad.html',
              contentType: 'Article',
              template: 'ReactBadMKay',
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
                  title: 'Pure JS very good',
                  permalink: '/articles/pure-js-very-good.html'
                },
                nextPost: {
                  title: 'Vue good',
                  permalink: '/articles/vue-good.html'
                }
              }
            },
            {
              title: 'Vue good',
              author: { title: 'Mustafa Enes', slug: 'enes' },
              date: '2025-11-04',
              permalink: '/articles/vue-good.html',
              contentType: 'Article',
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
                previousPost: {
                  title: 'React bad',
                  permalink: '/articles/react-bad.html'
                },
                nextPost: null
              }
            }
          ]
        }
      ],
      posts: []
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
          contentType: 'Book',
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
            previousPost: null,
            nextPost: {
              title: 'HTML',
              permalink: '/books/html.html'
            }
          }
        },
        {
          title: 'HTML',
          author: { title: 'Sir Tim Berners Lee', slug: 'tim' },
          date: '2025-11-05',
          permalink: '/books/html.html',
          contentType: 'Book',
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
            previousPost: {
              title: 'Football',
              permalink: '/books/football.html'
            },
            nextPost: null
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
          contentType: 'Person',
          events: [
            {
              title: 'Lets HTML now',
              slug: 'lets-html-now',
              permalink: '/events/lets-html-now.html'
            },
            {
              title: 'Lets get together',
              slug: 'lets-get-together',
              permalink: '/events/lets-get-together.html'
            }
          ],
          demos: [
            {
              title: 'Carpet Motifs',
              slug: 'carpet-motifs',
              permalink: '/demos/css/css-art/carpet-motifs'
            },
            {
              title: 'Realist Painting',
              slug: 'realist-painting',
              permalink: '/demos/css/css-art/realist-painting.html'
            },
            {
              title: 'Grid vs Flexbox',
              slug: 'grid-vs-flexbox',
              permalink: '/demos/css/grid/grid-vs-flexbox'
            },
            {
              title: 'Minesweeper',
              slug: 'minesweeper',
              permalink: '/demos/threejs/sprite/minesweeper'
            },
            {
              title: 'Stickman',
              slug: 'stickman',
              permalink: '/demos/threejs/sprite/stickman.html'
            },
            {
              title: 'Intelligent Drum n Bass',
              slug: 'intelligent-drum-n-bass',
              permalink: '/demos/threejs/intelligent-drum-n-bass'
            },
            { title: 'Hello World', slug: 'hello-world', permalink: '/demos/hello-world' },
            { title: 'Hey World', slug: 'hey-world', permalink: '/demos/hey-world' }
          ],
          articles: [
            {
              title: 'Hello Design',
              slug: 'hello-design',
              permalink: '/articles/guides/hello-design.html'
            },
            {
              title: 'Introduction to CSS Grid',
              slug: 'introduction-to-css-grid',
              permalink: '/articles/guides/introduction-to-css-grid.html'
            },
            {
              title: 'React bad',
              slug: 'react-bad',
              permalink: '/articles/react-bad.html'
            },
            { title: 'Vue good', slug: 'vue-good', permalink: '/articles/vue-good.html' }
          ],
          content: "Hey, it's me.",
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
        },
        {
          title: 'Sir Alex Ferguson',
          slug: 'alex',
          date: '2025-11-06',
          permalink: '/authors/alex.html',
          contentType: 'Person',
          events: [
            {
              title: 'ManU - CFC',
              slug: 'manu-cfc',
              permalink: '/events/manu-cfc.html'
            }
          ],
          books: [
            { title: 'Football', slug: 'football', permalink: '/books/football.html' }
          ],
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
              title: 'Mustafa Enes',
              permalink: '/authors/enes.html'
            },
            nextPost: {
              title: 'Sir Tim Berners Lee',
              permalink: '/authors/tim.html'
            }
          }
        },
        {
          title: 'Sir Tim Berners Lee',
          slug: 'tim',
          date: '2025-11-07',
          permalink: '/authors/tim.html',
          contentType: 'Person',
          events: [
            {
              title: 'Lets HTML now',
              slug: 'lets-html-now',
              permalink: '/events/lets-html-now.html'
            },
            {
              title: 'Lets get together',
              slug: 'lets-get-together',
              permalink: '/events/lets-get-together.html'
            },
            {
              title: 'What to do',
              slug: 'what-to-do',
              permalink: '/events/what-to-do.html'
            }
          ],
          demos: [
            {
              title: 'Hello Grid',
              slug: 'hello-grid',
              permalink: '/demos/css/grid/hello-grid.html'
            },
            {
              title: 'Hello CSS',
              slug: 'hello-css',
              permalink: '/demos/css/hello-css.html'
            },
            {
              title: 'Simple 3D',
              slug: 'simple-3d',
              permalink: '/demos/threejs/simple-3d.html'
            },
            {
              title: 'good-morning-world',
              slug: 'good-morning-world',
              permalink: '/demos/good-morning-world.html'
            }
          ],
          books: [
            { title: 'HTML', slug: 'html', permalink: '/books/html.html' }
          ],
          articles: [
            {
              title: 'Pure JS very good',
              slug: 'pure-js-very-good',
              permalink: '/articles/pure-js-very-good.html'
            }
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
            previousPost: {
              title: 'Sir Alex Ferguson',
              permalink: '/authors/alex.html'
            },
            nextPost: null
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
          contentType: 'Technology',
          categoryContentType: 'Technique',
          categoryAlias: 'technique',
          categoriesAlias: 'techniques',
          content: '<h1 id="welcome-to-cascade">Welcome to cascade</h1>',
          categories: [
            {
              title: 'CSS Art',
              slug: 'css-art',
              date: '2025-11-08',
              contentType: 'Technique',
              content: '',
              categories: [],
              posts: [
                {
                  title: 'Carpet Motifs',
                  maker: { title: 'Mustafa Enes', slug: 'enes' },
                  date: '2025-11-11',
                  permalink: '/demos/css/css-art/carpet-motifs',
                  contentType: 'Demo',
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
                      title: 'Grid vs Flexbox',
                      permalink: '/demos/css/grid/grid-vs-flexbox'
                    },
                    nextPost: {
                      title: 'Realist Painting',
                      permalink: '/demos/css/css-art/realist-painting.html'
                    }
                  }
                },
                {
                  title: 'Realist Painting',
                  maker: { title: 'Mustafa Enes', slug: 'enes' },
                  date: '2025-11-12',
                  permalink: '/demos/css/css-art/realist-painting.html',
                  contentType: 'Demo',
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
                      title: 'Carpet Motifs',
                      permalink: '/demos/css/css-art/carpet-motifs'
                    },
                    nextPost: null
                  }
                }
              ]
            },
            {
              title: 'Grid',
              slug: 'grid',
              date: '2025-11-09',
              contentType: 'Technique',
              content: '',
              categories: [],
              posts: [
                {
                  title: 'Grid vs Flexbox',
                  maker: { title: 'Mustafa Enes', slug: 'enes' },
                  date: '2025-11-10',
                  permalink: '/demos/css/grid/grid-vs-flexbox',
                  contentType: 'Demo',
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
                      title: 'Carpet Motifs',
                      permalink: '/demos/css/css-art/carpet-motifs'
                    }
                  }
                },
                {
                  title: 'Hello Grid',
                  maker: { title: 'Sir Tim Berners Lee', slug: 'tim' },
                  date: '2025-11-09',
                  permalink: '/demos/css/grid/hello-grid.html',
                  contentType: 'Demo',
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
              contentType: 'Demo',
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
          contentType: 'Technology',
          categoryContentType: 'Technique',
          categoryAlias: 'technique',
          categoriesAlias: 'techniques',
          content: '<h1>Welcome to three stuff</h1>',
          categories: [
            {
              title: 'Sprite',
              slug: 'sprite',
              date: '2025-11-11',
              contentType: 'Technique',
              content: '',
              categories: [],
              posts: [
                {
                  title: 'Minesweeper',
                  maker: { title: 'Mustafa Enes', slug: 'enes' },
                  date: '2025-11-10',
                  permalink: '/demos/threejs/sprite/minesweeper',
                  contentType: 'Demo',
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
                      title: 'Simple 3D',
                      permalink: '/demos/threejs/simple-3d.html'
                    },
                    nextPost: {
                      title: 'Stickman',
                      permalink: '/demos/threejs/sprite/stickman.html'
                    }
                  }
                },
                {
                  title: 'Stickman',
                  maker: { title: 'Mustafa Enes', slug: 'enes' },
                  date: '2025-11-11',
                  permalink: '/demos/threejs/sprite/stickman.html',
                  contentType: 'Demo',
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
                      title: 'Minesweeper',
                      permalink: '/demos/threejs/sprite/minesweeper'
                    },
                    nextPost: {
                      title: 'Ipsum demo',
                      permalink: '/demos/threejs/webgpu/ipsum-demo.html'
                    }
                  }
                }
              ]
            },
            {
              title: 'WebGPU',
              slug: 'webgpu',
              date: '2025-11-12',
              contentType: 'Technique',
              content: '',
              categories: [],
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
                      title: 'Stickman',
                      permalink: '/demos/threejs/sprite/stickman.html'
                    },
                    nextPost: {
                      title: 'Lorem Demo',
                      permalink: '/demos/threejs/webgpu/lorem-demo'
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
                    previousPost: {
                      title: 'Ipsum demo',
                      permalink: '/demos/threejs/webgpu/ipsum-demo.html'
                    },
                    nextPost: null
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
              contentType: 'Demo',
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
                previousPost: null,
                nextPost: {
                  title: 'Simple 3D',
                  permalink: '/demos/threejs/simple-3d.html'
                }
              }
            },
            {
              title: 'Simple 3D',
              maker: { title: 'Sir Tim Berners Lee', slug: 'tim' },
              date: '2025-11-09',
              permalink: '/demos/threejs/simple-3d.html',
              contentType: 'Demo',
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
                  title: 'Intelligent Drum n Bass',
                  permalink: '/demos/threejs/intelligent-drum-n-bass'
                },
                nextPost: {
                  title: 'Minesweeper',
                  permalink: '/demos/threejs/sprite/minesweeper'
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
          contentType: 'Demo',
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
            previousPost: null,
            nextPost: {
              title: 'good-morning-world',
              permalink: '/demos/good-morning-world.html'
            }
          }
        },
        {
          title: 'Hey World',
          maker: { title: 'Mustafa Enes', slug: 'enes' },
          date: '2025-12-06',
          permalink: '/demos/hey-world',
          contentType: 'Demo',
          tags: ['html', 'hey world'],
          content: '<h1>Hey world</h1>\n\n<p>Adipisicing nesciunt ab quos eos nesciunt Nemo ab aliquid quod magnam eaque voluptatem. Possimus tenetur veniam nostrum magnam in? Ipsa atque cupiditate illum hic mollitia Soluta excepturi vel consequatur exercitationem.</p>',
          context: {
            collection: {
              title: 'demos',
              permalink: '/demos'
            },
            categories: []
          },
          links: {
            nextPost: null,
            previousPost: {
              title: 'good-morning-world',
              permalink: '/demos/good-morning-world.html'
            }
          }
        },
        {
          title: 'good-morning-world',
          maker: { title: 'Sir Tim Berners Lee', slug: 'tim' },
          date: '2025-11-07',
          permalink: '/demos/good-morning-world.html',
          contentType: 'Demo',
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
            previousPost: {
              title: 'Hello World',
              permalink: '/demos/hello-world'
            },
            nextPost: {
              title: 'Hey World',
              permalink: '/demos/hey-world'
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
          contentType: 'Event',
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
            previousPost: null,
            nextPost: {
              title: 'Lets get together',
              permalink: '/events/lets-get-together.html'
            }
          }
        },
        {
          title: 'Lets get together',
          date: '2024-11-13',
          permalink: '/events/lets-get-together.html',
          contentType: 'Event',
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
              title: 'Lets HTML now',
              permalink: '/events/lets-html-now.html'
            },
            nextPost: {
              title: 'ManU - CFC',
              permalink: '/events/manu-cfc.html'
            }
          }
        },
        {
          title: 'ManU - CFC',
          date: '2025-11-13',
          permalink: '/events/manu-cfc.html',
          contentType: 'Event',
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
              title: 'Lets get together',
              permalink: '/events/lets-get-together.html'
            },
            nextPost: {
              title: 'What to do',
              permalink: '/events/what-to-do.html'
            }
          }
        },
        {
          title: 'What to do',
          date: '2025-11-18',
          permalink: '/events/what-to-do.html',
          contentType: 'Event',
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
            previousPost: {
              title: 'ManU - CFC',
              permalink: '/events/manu-cfc.html'
            },
            nextPost: null
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
    },
    {
      title: 'A page here',
      permalink: '/a-page-here.html',
      date: '2025-11-18',
      content: 'This is a page'
    },
    {
      title: 'A page there',
      permalink: '/a-page-there.html',
      date: '2025-11-20',
      content: 'A page there'
    },
    {
      title: 'And this one',
      permalink: '/and-this-one',
      date: '2025-11-22',
      content: 'This is another subpage in the pages directory'
    }
  ],
  assets: [
    {
      title: 'an asset',
      permalink: '/assets/an asset'
    },
    {
      title: 'some.jpeg',
      permalink: '/assets/some.jpeg'
    },
    {
      title: 'here.mp4',
      permalink: '/assets/here.mp4'
    },
    {
      title: 'are',
      permalink: '/assets/are'
    },
    {
      title: 'a foldered asset in pages directory',
      permalink: '/assets/a foldered asset in pages directory'
    },
    {
      title: 'an asset in pages directory.png',
      permalink: '/assets/an asset in pages directory.png'
    }
  ]
}

module.exports = {
  FIXTURE_SETTINGS,
  FIXTURE_CONTENT_MODEL
}
