const { version: vn } = require('../../package.json')

module.exports = `
writ (v${vn})
=============

Interface
---------
$ writ <command> [<options>]


Commands
--------
build: Run once to produce build output
start: Start livereloading preview and rerun on changes
create: Create from scratch


Options
-------
any path              | Target directory
(default: .)          |
———————————————————————————————————————————————————————
--debug, -d           | Enable debug mode
(default: false)      |
———————————————————————————————————————————————————————
--refresh-theme, -r   | Regenerate theme directory.
(default: false)      |
                      | Use with caution.
                      |
                      | Everything inside theme folder
                      | (except theme/keep) is deleted
                      | and re-created. Keep a copy of
                      | your changes in keep folder not
                      | to lose them.
                      |
                      | Useful for fetching updates of
                      | chosen base theme during custom
                      | theme development.


Usage
-----
Start local development in current working directory:
$ writ start

Produce a build output in current working directory:
$ writ build

Target a different directory:
$ writ start ../the-other-directory

Start in a specified directory in debug mode:
$ writ start ../the-other-directory --debug

Refresh theme directory and start development
$ writ start --refresh-theme

Create a project from scratch
$ writ create
`
