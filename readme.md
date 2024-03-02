# Writ-CMS

A spirited web engine, in early development.

[![tests status badge](https://github.com/scriptype/writ-cms/actions/workflows/tests.yml/badge.svg)](https://github.com/scriptype/writ-cms/actions/workflows/tests.yml)
[![Coverage Status](https://coveralls.io/repos/github/scriptype/writ-cms/badge.svg?fuckgithubcache=true)](https://coveralls.io/github/scriptype/writ-cms?branch=master)

## Contents

- [The idea](#the-idea)
- [Example websites](#example-websites)
- [Usage](#usage)
- [Installation](#installation)
- [Manual](#manual)
- [Development](#development)

## The idea

When I'm writing a blog post, I want to deal with the least amount of software complexity.

- I should be able to compose freeform html, rich text and markdown
- I should be able to just use GUI from start to end
- I should be able to organize categories, posts and pages using folders and text files
- I should get automated index pages, pagination, sitemap, rss, search etc. without touching code
- I should be able to easily customize it
- I should be able to use it without remembering much
- And, **everyone** also should be able to do all of those.

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

#### Foldered posts

If you need to refer/embed static assets, such as photos or demo iframes, within the post,
the easiest way is to have a folder for everything the post needs, including the post itself.

Create a foldered post:
1) Create a folder
2) Inside the folder, create a text file named "post". e.g post.md, post.txt

Human readable name of the folder will be the post title.

A post file can look like this:

```
My new post starts like this.

And it ends like this.
```

You can also add metadata like this in the beginning of a post file
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

#### Foldered subpages

Just like with foldered posts, foldered subpages is the easiest way to manage local assets.

1) Create a folder inside the "pages" directory
2) Inside the folder, create a text file named "page". e.g. page.txt, page.md, page.html

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

## Development

Clone writ-cms by running:

```sh
git clone git@github.com:scriptype/writ-cms.git
```

Then set it up:

```sh
cd writ-cms
npm install

# Sets up the git hooks
npm run hookup

# Recommended for being able to quickly test things in any directory
npm i -g .
```
