# Writ-CMS

A static site generator that is intended to be very easy to use, develop and extend.

Work in progress.

## Contents

- [Idea](https://github.com/scriptype/writ-cms#idea)
- [Installation](https://github.com/scriptype/writ-cms#installation)
- [Usage](https://github.com/scriptype/writ-cms#usage)
- [Manual](https://github.com/scriptype/writ-cms#maual)
  - [Entry formats](https://github.com/scriptype/writ-cms#entry-formats)
  - [Posts](https://github.com/scriptype/writ-cms#posts)
  - [Subpages](https://github.com/scriptype/writ-cms#subpages)
  - [Static assets](https://github.com/scriptype/writ-cms#static-assets)

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

## Installation

```sh
# Clone writ-cms
git clone git@github.com:scriptype/writ-cms.git

# Install dependencies
cd writ-cms
npm install
npm i -g .
```

## Usage

```sh
# Create your blog folder
mkdir "New blog"
cd "New blog"

# Create any text file (.hbs, .md, .markdown, .txt, .html)
echo "Hello" > hello.txt

# Start live preview editor mode
writ start

# Compile final site for deployment purposes
writ build

# Print CLI manual for more
writ
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

A post file can look like this:

```
My new post starts like this.

And it ends like this.
```

You can also add metadata like this at the beginning of a post file
```
---
type: text-post
date: 2023-01-05, 01:57
tags: bananas, books
musiclist:
 - Your favorite artist - A song
---
My new post starts like this.

And it ends like this.
```

"musiclist" is displayed at the end of the post when it's rendered.

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
