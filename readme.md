# Writ-CMS

A spirited web engine for humans.

🚧 **Work in progress.**

<details>
<summary><h2>The idea</h2></summary>

When I'm writing a blog post, I want to deal with the least amount of software complexity.

- I should be able to compose freeform html, rich text and markdown
- I should be able to just use GUI from start to end
- I should be able to organize categories, posts and pages using folders and text files
- I should get automated index pages, pagination, sitemap, rss, search etc. without touching code
- I should be able to easily customize it
- I should be able to use it without remembering much
- And, **everyone** also should be able to do all of the those.
</details>
<details>
<summary><h2>Example sites</h2></summary>

Currently, only I'm using this system. Have a look at:

- A simple writ project: https://github.com/scriptype/writ
- The default frontend: https://writ.enes.in
</details>
<details>
<summary><h2>Warnings</h2></summary>

- This software is not ready for production use and, therefore, cannot be held accountable for any loss of value.
  - It is generally advised to use [git](https://git-scm.com/doc) in text-heavy personal projects, such as a website, to avoid content loss.
</details>
<details>
<summary><h2>Usage</h2></summary>

### 1) Name your site
```sh
mkdir "All about trees"
cd "All about trees"
```

### 2) Create a post
```sh
echo "Pines are nice" > "Hello world.txt"
```

### 3) Preview & live edit
```sh
writ start
```
</details>
<details>
<summary><h2>Installation</h2></summary>

```sh
npm install -g scriptype/writ-cms
```
</details>
<details>
<summary><h2>Manual</h2></summary>

### Entry formats

- Any text file (.txt, .md, .markdown, .hbs, .html).
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
</details>
