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
      name: 'articles',
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
          name: 'Guides',
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
              content: 'Design design design'
            },
            {
              title: 'Introduction to CSS Grid',
              author: { title: 'Mustafa Enes', slug: 'enes' },
              date: '2025-11-06',
              permalink: '/articles/guides/introduction-to-css-grid.html',
              tags: ['css', 'grid', 'art direction', 'design'],
              content: 'All about grid'
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
          content: 'pure js very good'
        },
        {
          title: 'React bad',
          author: { title: 'Mustafa Enes', slug: 'enes' },
          date: '2025-11-03',
          permalink: '/articles/react-bad.html',
          tags: ['javascript', 'react', 'performance', 'accessibility', 'devx'],
          content: 'react not good'
        },
        {
          title: 'Vue good',
          author: { title: 'Mustafa Enes', slug: 'enes' },
          date: '2025-11-04',
          permalink: '/articles/vue-good.html',
          tags: ['javascript', 'vue', 'performance', 'accessibility', 'devx'],
          content: 'vue good'
        }
      ]
    },
    {
      name: 'books',
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
          content: 'Welcome to football.'
        },
        {
          title: 'HTML',
          author: { title: 'Sir Tim Berners Lee', slug: 'tim' },
          date: '2025-11-05',
          permalink: '/books/html.html',
          genre: 'technology',
          tags: ['html', 'web', 'internet'],
          content: 'Welcome to hypertext era.'
        }
      ]
    },
    {
      name: 'authors',
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
          content: 'Hey, it\'s me.'
        },
        {
          title: 'Sir Alex Ferguson',
          slug: 'alex',
          date: '2025-11-06',
          permalink: '/authors/alex.html',
          events: [{ title: 'ManU - CFC', slug: 'manu-cfc' }],
          content: 'Chewing a gum.'
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
          content: ''
        }
      ]
    },
    {
      name: 'demos',
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
          name: 'CSS',
          slug: 'css',
          title: 'Cascade all the way',
          date: '2025-11-07',
          categoryContentType: 'Technique',
          categoryAlias: 'technique',
          categoriesAlias: 'techniques',
          content: '<h1 id="welcome-to-cascade">Welcome to cascade</h1>',
          categories: [
            {
              name: 'CSS Art',
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
                  content: 'Carpet shapes'
                },
                {
                  title: 'Realist Painting',
                  maker: { title: 'Mustafa Enes', slug: 'enes' },
                  date: '2025-11-12',
                  permalink: '/demos/css/css-art/realist-painting.html',
                  tags: ['css', 'art', 'painting'],
                  content: 'A lot of css'
                }
              ]
            },
            {
              name: 'Grid',
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
                  content: 'A versus'
                },
                {
                  title: 'Hello Grid',
                  maker: { title: 'Sir Tim Berners Lee', slug: 'tim' },
                  date: '2025-11-09',
                  permalink: '/demos/css/grid/hello-grid.html',
                  tags: ['css', 'layout', 'grid'],
                  content: 'let there be grid'
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
              content: 'there is css'
            }
          ]
        },
        {
          name: 'Three.js',
          slug: 'threejs',
          title: 'Not one and not two, it\'s three',
          date: '2025-11-10',
          categoryContentType: 'Technique',
          categoryAlias: 'technique',
          categoriesAlias: 'techniques',
          content: '<h1 id="welcome-to-three-stuff">Welcome to three stuff</h1>',
          categories: [
            {
              name: 'Sprite',
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
                  content: 'A Classic'
                },
                {
                  title: 'Stickman',
                  maker: { title: 'Mustafa Enes', slug: 'enes' },
                  date: '2025-11-11',
                  permalink: '/demos/threejs/sprite/stickman.html',
                  tags: ['game'],
                  content: 'stickman demo'
                }
              ]
            },
            {
              name: 'WebGPU',
              slug: 'webgpu',
              date: '2025-11-12',
              content: '',
              posts: [
                {
                  title: 'Ipsum demo',
                  date: '2025-11-12',
                  permalink: '/demos/threejs/webgpu/ipsum-demo.html',
                  content: ''
                },
                {
                  title: 'Lorem Demo',
                  date: '2025-11-13',
                  permalink: '/demos/threejs/webgpu/lorem-demo',
                  content: ''
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
              content: 'Impala on the F ring'
            },
            {
              title: 'Simple 3D',
              maker: { title: 'Sir Tim Berners Lee', slug: 'tim' },
              date: '2025-11-09',
              permalink: '/demos/threejs/simple-3d.html',
              content: 'Some simple 3d demo'
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
          content: '<h1>Hello world</h1>\n\n<p>Elit dolorum iure porro optio vel eveniet Quos labore ab deleniti labore asperiores. Blanditiis magni suscipit hic ut delectus Libero atque porro harum cum tempora Ullam culpa distinctio dignissimos ex.</p>'
        },
        {
          title: 'good-morning-world',
          maker: { title: 'Sir Tim Berners Lee', slug: 'tim' },
          date: '2025-11-07',
          permalink: '/demos/good-morning-world.html',
          tags: ['html', 'attributes', 'good morning'],
          content: '<h1>Good morning world</h1>\n\n<p align="center">Elit dolorum iure porro optio vel eveniet Quos labore ab deleniti labore asperiores. Blanditiis magni suscipit hic ut delectus Libero atque porro harum cum tempora Ullam culpa distinctio dignissimos ex.</p>'
        }
      ]
    },
    {
      name: 'events',
      date: '2025-11-13',
      entryContentType: 'Event',
      facets: ['lorem', 'ipsum', 'dolor'],
      content: '',
      categories: [],
      posts: [
        {
          title: 'Lets HTML now',
          date: '2025-11-13',
          permalink: '/events/lets-html-now.html',
          organizers: [{ title: 'Sir Tim Berners Lee', slug: 'tim' }],
          participants: [{ title: 'Mustafa Enes', slug: 'enes' }],
          content: 'html good'
        },
        {
          title: 'Lets get together',
          date: '2025-11-13',
          permalink: '/events/lets-get-together.html',
          organizers: [
            { title: 'Mustafa Enes', slug: 'enes' },
            { title: 'Sir Tim Berners Lee', slug: 'tim' }
          ],
          content: 'And call it an event'
        },
        {
          title: 'ManU - CFC',
          date: '2025-11-13',
          permalink: '/events/manu-cfc.html',
          participants: [{ title: 'Sir Alex Ferguson', slug: 'alex' }],
          content: ''
        },
        {
          title: 'What to do',
          date: '2025-11-13',
          permalink: '/events/what-to-do.html',
          participants: [{ title: 'Sir Tim Berners Lee', slug: 'tim' }],
          content: ''
        }
      ]
    }
  ],
  subpages: [
    {
      permalink: '/about-us.html',
      date: '2025-11-14',
      content: 'Something about us'
    },
    {
      permalink: '/newsletter.html',
      date: '2025-11-15',
      content: 'Sign up now'
    }
  ]
}

module.exports = {
  FIXTURE_SETTINGS,
  FIXTURE_CONTENT_MODEL
}
