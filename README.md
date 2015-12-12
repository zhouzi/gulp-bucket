# gulp-bucket

Maximize gulp tasks reusability.

* [Installation](#installation)
* [What problems does gulp-bucket solve?](#what-problems-does-gulp-bucket-solve)
* [Example](#example)

## Installation

```
npm install gulp-bucket
```

You can then require gulp-bucket:

```javascript
var bucket = require('gulp-bucket').default // ES5
import bucket from 'gulp-bucket' // ES6
```

## What problems does gulp-bucket solve?

**Code reusability**

gulp-bucket offers a way to define a task once and reuse it as much as needed by putting the emphasis on agnostic definitions. No more hard coded paths!

**Tasks dependencies**

With gulp, a task's dependency is just a list of tasks names e.g: `gulp.task('foo', ['bar', 'quz'], function () {})`.
So even if you are defining your tasks in separate file, you might still have to hard code the dependencies.

gulp-bucket tries to make this process simpler by allowing you to define a task's dependencies right from the task itself:

```javascript
function (config) {
  return [
    bucket.factory('lint', lint).add(config),
    function () {}
  ]
}
```

*Have a look at the [example](#example) for more details.*

**Implicit declarations**

Whenever you create a new factory, gulp-bucket automatically creates a task that's going to run every tasks created from it.
So basically, if you add a `scripts` factory and a `foo` task with it, you'll end up with two tasks: `scripts` and `scripts:foo`.
In this case, `scripts` would run `scripts:foo`.

**Listing tasks**

After initing gulp-bucket by providing a gulp instance (via `gulp.use()`) it will create a "help" task.
This task display and group all available tasks to the console (fancy colors included).

## Example

**Structure**

```
|__gulp/
|____tasks/
|______lint.js
|______scripts.js
|______styles.js
|______watch.js
|____config.json
|__eslint.json
|__gulpfile.babel.js
```

**gulpfile.babel.js**

```javascript
import gulp from 'gulp'
import bucket from 'gulp-bucket'
import yargs from 'yargs'

import scripts from './gulp/tasks/scripts'
import styles from './gulp/tasks/styles'
import watch from './gulp/tasks/watch'
import config from './gulp/config.json'

bucket
  .use(gulp)
  .options(yargs.argv)
  
bucket.main(
  bucket
    .factory('scripts', scripts)
    .add(config.js), 
    
  bucket
    .factory('styles', styles)
    .add(config.scss)
)

bucket
  .factory('watch', watch)
  .add(
    config.js.map((config) => ({
      alias: `scripts/${config.alias}`,
      src: config.src,
      deps: bucket.name('scripts', config.alias)
    })),
    
    config.scss.map((config) => ({
      alias: `styles/${config.alias}`,
      src: config.src,
      deps: bucket.name('styles', config.alias)
    }))
  )
```

**gulp/config.json**

```json
{
  "js": [
    { "alias": "vendors", "src": "js/vendors/**/*.js", "dest": "dist/js", "lint": false },
    { "alias": "app", "src": "js/app/**/*.js", "dest": "dist/js" }
  ],
  
  "scss": [
    { "alias": "vendors", "src": "scss/vendors/**/*.scss", "dest": "dist/css" },
    { "alias": "app", "src": "scss/app/**/*.scss", "dest": "dist/css" }
  ]
}
```

**gulp/tasks/lint.js**

```javascript
import gulp from 'gulp'
import eslint from 'gulp-eslint'

export default function (config) {
  return [
    function () {
      return gulp
        .src(config.src)
        .pipe(eslint({ configFile: 'eslint.json' }))
        .pipe(eslint.format())
        .pipe(eslint.failAfterError())
    }
  ]
}
```

**gulp/tasks/scripts.js**

```javascript
import gulp from 'gulp'
import bucket from 'gulp-bucket'
import uglify from 'gulp-uglify'
import lint from './lint'

export default function (config, options) {
  return [
    config.lint !== false ? bucket.factory('lint', lint).add(config) : null,
    function () {
      let stream = gulp.src(config.src)
      
      if (options.build === true) stream = stream.pipe(uglify())
      
      stream = stream.pipe(gulp.dest(config.dest))
      return stream
    }
  ]
}
```

**gulp/tasks/styles.js**

```javascript
import gulp from 'gulp'
import sass from 'gulp-sass'
import autoprefixer from 'gulp-autoprefixer'

export default function (config) {
  return [
    function () {
      return gulp
        .src(config.src)
        .pipe(sass())
        .pipe(autoprefixer())
        .pipe(gulp.dest(config.dest))
    }
  ]
}
```

**gulp/tasks/watch.js**

```javascript
import gulp from 'gulp'

export default function (config) {
  return [
    function () {
      const deps = Array.isArray(config.deps) ? deps : [config.deps]
      return gulp.watch(config.src, deps)
    }
  ]
}
```

**output**

gulp-bucket automatically creates a "help" task that, for this example, would output:

```
$ gulp help
help
---
scripts
scripts:vendors
scripts:app
---
lint
lint:app
---
styles
styles:vendors
styles:app
---
default
---
watch
watch:scripts/vendors
watch:scripts/app
watch:styles/vendors
watch:styles/app
---
```

Note: the default task is created by `bucket.main()` which takes an array of dependencies, flatten it and use it for the "default" task.
