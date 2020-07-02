⚠️ gulp-bucket is not maintained anymore and is very much out of date, both in terms of approach and code. ⚠️

# gulp-bucket

Maximize gulp tasks reusability.

* [Installation](#installation)
* [What problems does gulp-bucket solve?](#what-problems-does-gulp-bucket-solve)
* [Example](#example)
* [Documentation](#documentation)
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

## Documentation

### factory(name, [factory])

Getter/setter that whether registers a factory that can be used to create tasks or return the existing one if factory is omitted.

1. **name** {String}: the name to be used as a prefix for the tasks created by this factory.
2. **factory** {Function}: a function to call every time a task gets added.

Return a registered [factory](#factory-api).

### main(...tasksNames)

Creates a default task that runs the provided tasks.
Note: flatten the array of task names so `['scripts', ['styles', 'styles:website']]` is perfectly valid.

1. **taskNames** {Array}: an array of tasks names.

Return the api.

### options([opts])

Getter/setter that whether merge opts with the existing ones or return them.
When a factory function is called it receives those options as second argument so that's usually where you'll set `build: true` for example.
Works great with command line arguments and packages like `yargs.argv`.

1. **opts** {Object}: options to add and provide to factories.

Return the api or the options if opts is omitted.

### tasks([taskName])

Return tasks names that start with taskName.

1. **taskName** {String}: the prefix to look for.

```javascript
// tasks: ['help', 'scripts', 'scripts:website', 'scripts:webapp']
bucket.tasks(); // ['help', 'scripts', 'scripts:website', 'scripts:webapp']
bucket.tasks('scripts'); // ['scripts', 'scripts:website', 'scripts:webapp']
bucket.tasks('scripts:'); // ['scripts:website', 'scripts:webapp']
```

Return an array of tasks that start with taskName or the full list if not provided.

### name(factoryName, [alias])

Return the name of a task according to its factoryName and alias.

1. **factoryName** {String}: the factory's name.
2. **alias** {String}: the task's alias.

```javascript
bucket.name('scripts') // 'scripts'
bucket.name('scripts', 'website') // 'scripts:website'
```

Return a task's name.

### Factory API

#### add(...configs)

Call factory for each config, which results in creating a task.
Note: there's only one required property to the config object: `config.alias` which is used to alias the task.
If not provided, it'll overwrite the default task.

Also note that, unless it gets overwritten, a root task is created that runs every tasks under its name.

1. **configs** {Array}: a list of configs that gets passed to the factory.

Return the list of tasks that got added/created.

#### defaults(config)

Sets the default config for the factory.

1. **config** {Object}: an object that'll get merged with the provided configs.

```javascript
bucket
  .factory('scripts', scripts)
  .defaults({ dest: 'build' })
  .add({ src: 'src/index.js' }); // the config object will end up being { dest: 'build', src: 'src/index.js' }
```

Return the factory api.

#### before([...tasksNames])

The root task will now run the provided list of tasks before its children.

1. **tasksNames** {Array}: a list of tasks names.

Return the factory api.

## Change Log

### 1.1.0 - 2016-04-10

* Add `before` to run tasks before a factory's root task
* Add `defaults` to define a config's defaults for a factory
* Fix the factory's root task to properly notify its end

### 1.0.0 - 2016-03-20

* *First release*
