# Writ-CMS

A static site generator that is intended to be very easy to use, develop and extend.

Work in progress.

***

## Idea

When I'm writing a blog post, I want to deal with the least amount of software complexity.

- I should be able to compose freeform html as well as markdown
- I should be able to create subpages that are not posts
- I should be able to organize posts and categories using folders and text files
- Post - Category relation should be automatized
- Homepage, category indexes, pagination, search, sitemap, rss should be automatized
- I should be able to use it without remembering much.

***

## Usage

```
# Let's clone writ-cms locally
git clone git@github.com:scriptype/writ-cms.git

# Install dependencies
cd writ-cms
npm install
cd ..

# Create your blog folder
mkdir my_new_blog
cd my_new_blog

# Create any text file (.hbs, .md, .markdown, .txt, .html)
echo "Hello" > hello.txt

# Start live preview editor mode
NODE_ENV=dev node -p "require('../writ-cms')().watch()"

# Compile final site for deployment purposes
NODE_ENV=build node -p "require('../writ-cms')().compile()"
```

***

## Docs

### Entry formats

- Any text file (plain text, HTML, markdown).
- Live WYSIWYG editor

### Categories

1) Create a folder

Folder name can be human readable and it will be used as the display name.

### Posts

Create a new uncategorized post:
1) Create a text file

Create a categorized post:
1) Go to a category folder
2) Create a text file inside the folder

Create a foldered post:
1) Go to a category folder
2) Create a folder inside the category
3) Create a text file with name "index" or "post". e.g index.md, post.txt

Human readable name of the folder will be the post title.

If the post needs static resources, such as photos, they can be kept in the same
folder as the post.

### Subpages

1) Create a folder named "pages"
2) Create a text file inside the folder

You can use a different folder for pages by adding this to `settings.json`:

```
"pagesDirectory": "my-different-pages-folder"
```

### Static assets

1) Create a folder named "assets"
2) Put any static assets into this folder

You can use a different folder for assets by adding this to `settings.json`:

```
"assetsDirectory": "my-different-assets-folder"
```
