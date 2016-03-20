# gulp-bucket

Maximize gulp tasks reusability.

* [Installation](#installation)
* [What problems does gulp-bucket solve?](#what-problems-does-gulp-bucket-solve)
* [Example](#example)
* [Change Log](#change-log)

## Installation

```
npm install gulp-bucket
```

You can then require gulp-bucket:

```javascript
var bucket = require('gulp-bucket')
```

## What problems does gulp-bucket solve?

**Code reusability**

gulp-bucket offers a way to define a task once and reuse it as much as needed by putting the emphasis on agnostic definitions.
No more hard coded paths!

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

**Available tasks**

There are a few tasks that comes with `gulp-bucket`:

* `tasks/help.js`: a task that display all available tasks with some fancy colors.
  * Installation: `bucket.factory('help', require('gulp-bucket/tasks/help')).add()`

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
|__gulpfile.js
```

**gulpfile.js**

```javascript
var bucket = require('gulp-bucket')
var yargs = require('yargs')

var scripts = require('./gulp/tasks/scripts')
var styles = require('./gulp/tasks/styles')
var watch = require('./gulp/tasks/watch')
var config = require('./gulp/config.json')

bucket
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
    config.js.map(function (config) {
      return {
        alias: 'scripts:' + config.alias,
        src: config.src,
        deps: bucket.name('scripts', config.alias)
      }
    }),

    config.scss.map(function (config) {
      return {
        alias: 'styles:' + config.alias,
        src: config.src,
        deps: bucket.name('styles', config.alias)
      }
    })
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
var gulp = require('gulp')
var eslint = require('gulp-eslint')

module.exports = function (config) {
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
var gulp = require('gulp')
var bucket = require('gulp-bucket')
var uglify = require('gulp-uglify')
var lint = require('./lint')

module.exports = function (config, options) {
  return [
    config.lint !== false ? bucket.factory('lint', lint).add(config) : null,
    function () {
      var stream = gulp.src(config.src)

      if (options.build === true) stream = stream.pipe(uglify())

      stream = stream.pipe(gulp.dest(config.dest))
      return stream
    }
  ]
}
```

**gulp/tasks/styles.js**

```javascript
var gulp = require('gulp')
var sass = require('gulp-sass')
var autoprefixer = require('gulp-autoprefixer')

module.exports = function (config) {
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
var gulp = require('gulp')

module.exports = function (config) {
  return [
    function () {
      var deps = Array.isArray(config.deps) ? deps : [config.deps]
      return gulp.watch(config.src, deps)
    }
  ]
}
```

Note: a default task is created by `bucket.main()` which takes an array of dependencies, flatten it and use it for the "default" task.

## Change Log

### 1.0.0 - 2016-03-20

* *First release*
