# Writ-CMS

A spirited web engine, in early development.

[![tests status badge](https://github.com/scriptype/writ-cms/actions/workflows/tests.yml/badge.svg)](https://github.com/scriptype/writ-cms/actions/workflows/tests.yml)

## Contents

- [The idea](#the-idea)
- [Example websites](#example-websites)
- [Usage](#usage)
- [Installation](#installation)
- [Manual](#manual)

## The idea

When I'm writing a blog post, I want to deal with the least amount of software complexity.

- I should be able to compose freeform html, rich text and markdown
- I should be able to just use GUI from start to end
- I should be able to organize categories, posts and pages using folders and text files
- I should get automated index pages, pagination, sitemap, rss, search etc. without touching code
- I should be able to easily customize it
- I should be able to use it without remembering much
- And, **everyone** also should be able to do all of the those.

## Example websites

Currently, only I'm using this system. Have a look at:

- A simple writ project: https://github.com/scriptype/writ
- The default frontend: https://writ.enes.in

## Usage

### 1) Name your site
```sh
mkdir "All about trees"
cd "All about trees"
```

### 2) Create a post
```sh
echo "Pines are nice" > "Hello world.txt"
```

### 3) Preview and edit
```sh
writ start
```

## Installation

```sh
npm install -g scriptype/writ-cms
```

## Manual

### Entry formats

- Accepted text file extensions: .txt, .md, .markdown, .hbs, .html.

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
type: text
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
</details>
