# Writ-CMS

A static site generator that is intended to be very easy to use, develop and extend.

Work in progress.

## Development

This repository is the core/backend of the site generator. Currently it's not
yet in the npm.

So, the only way to move forward is to clone this locally and use
`npm link` to link it locally as a dependency to an actualy blog project.

For now, I just use my personal sample blog as the callsite for the CMS.

```
git clone git@github.com:scriptype/writ-cms.git
cd writ-cms
npm install
cd ..

# Clone my personal blog that will use the CMS
git clone git@github.com:scriptype/writ.git
cd writ
npm install
npm link writ-cms ../writ-cms
npm start
```

## Docs

This project is under heavy construction, so don't expect any of this to stay the same
or work without bugs. But I'll keep improving these docs and use them as a reference
point or even a spec for the project from now on.

### Template support

Currently, the only supported template engine is Handlebars.


### Theming

Currently, you can't edit styling or source code of the generated site.

### Starting a blog with a post

Currently, you need to have local copy of the cms in your computer somewhere to
be able to use it. So, follow the instructions from the development section above
to clone this repository. You can skip cloning my personal project, as we'll create
one from scratch below.

1) Create a new empty folder named "My blog" and enter it.
2) Create a file named `Hello, world.hbs`
3) Create a file named `settings.json` with following contents:
```
{
  "site": {
    "title": "My new blog",
    "description": "Welcome to my new blog"
  },
  "ignorePaths": [
    "_.*",
    "settings.json",
    "start.js"
  ]
}

```

4) Create a file named `start.js` with following content:

```
const settings = require('./settings.json')
const compile = require('writ-cms')
compile(settings)
```

To be able to run `require('writ-cms')`, you either need to wait until this
becomes an npm package, or link a local clone of `writ-cms` to your blog project,
using `npm link` (i.e. `npm link writ-cms ../writ-cms`)

5) Run `node start`

Now you should see:

- A new folder named "\_site" appears in your blog folder
- A homepage is generated and it lists the only post "Hello, world"
- The post should fall into the default category "Uncategorized"
- The category link of "Uncategorized" should appear under the blog title
- Clicking the category link should take you to a category index page
- You should see the "Hello, world" being listed in the "Uncategorized" category index page
- A posts.json file appears in your blog folder and it has the data of "Hello, world"

### Creating a new post

Every `.hbs` file in your blog is automatically a post. So, just create it.

1) Create a file named "My new post.hbs"
2) Run `node start`

Now you should see:

- A new post is generated from this file.
- The new post also belongs to "Uncategorized".

### Creating a category

Every folder in your blog is automatically a category. So, you just need to create
a folder and put any `.hbs` files in it.

1) Create a folder named "Tutorials"
2) Inside the folder, create a file named "CSS Grid.hbs"
2) Run `node start`

Now you should see:

- A new post named "CSS Grid" has been generated
- This post belongs to "Tutorials" category
- You should see the category appearing in the homepage, below the site title

### Creating a subpage

1) Create a folder named "pages"
2) Create a file named "about.hbs" or "about.html"
3) Run `node start`

Now you should see:

- A subpage appears at the url: `localhost:3001/about.html`
- This subpage won't appear anywhere in the homepage, by default

You can tell the cms to use a different folder name by adding this to your `settings.json`:

```
"pagesDirectory": "my-pages-folder-name"
```

In this case, the cms will expect your pages folder to be named "my-pages-folder-name"

### Keeping static assets

Currently any file with an extension other than `.hbs` is currently treated as a
static asset to just copy. So, you can put static assets wherever you want.

However, it is often practical to keep them all in one folder. For that purpose,
you can:

1) Create a folder named "assets"
2) Put any static assets into this folder

By default, the "assets" is recognized as a folder of static assets to copy. But,
you can tell the cms to use a different folder name by adding this to your `settings.json`:

```
"assetsDirectory": "static-stuff"
```

In this case, the cms will expect your assets folder to be named "static-stuff"
