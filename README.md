# gulp-bucket

Highly reusable gulp task definition.

* [Introduction](https://github.com/Zhouzi/gulp-bucket#introduction)
* [Install](https://github.com/Zhouzi/gulp-bucket#install)
* [Example](https://github.com/Zhouzi/gulp-bucket#example)
* [Documentation](https://github.com/Zhouzi/gulp-bucket#documentation)

## Introduction

Let's say you have a task that does some stuff with JavaScript files and output a `bundle-1.js` file.
Now, you want to go through the same pipeline but with different inputs and create `bundle-2.js`.
You'll have to whether write twice the same task or go through some kind of `.forEach`, iterating on a list of configurations.

This is actually what gulp-bucket is about: defining factory functions that receive a configuration and an option object to create tasks.
It also helps you elegantly managing tasks dependencies by declaring them "on-the-fly" where it makes sense.

## Install

```
npm install gulp-bucket
```

You can now require gulp-bucket:

```javascript
// ES5
var bucket = require('gulp-bucket').default

// ES6
import bucket from 'gulp-bucket'
```

## Example

```javascript
import gulp from 'gulp'
import bucket from 'gulp-bucket'
import concat from 'gulp-concat'

const copy = function (config, options) {
  return [
    function () {
      return gulp
        .src(config.src)
        .pipe(config.dest)
    }
  ]
}

const scripts = function (config, options) {
  return [
    options.copy === true ? copy(config) : null,
    function () {
      return gulp
        .src(config.src)
        .pipe(concat(config.exportAs))
        .pipe(config.dest)
    }
  ]
}

bucket.options({ copy: true })

bucket.setDefaultTask([
  bucket('scripts', scripts, [
    { alias: 'vendors', src: 'src/vendors/*.js', dest: 'dist' },
    { alias: 'app', src: 'src/app/*.js', dest: 'dist' }
  ])
])
```

The example above would create those tasks:

* **help** - logs existing tasks (automatically created by requiring gulp-bucket)
* **default** - runs every tasks defined in `setDefaultTask()`
* **scripts** - runs every tasks with the prefix "scripts"
* **scripts:vendors** - runs the "scripts" task with the "vendors" configuration 
* **scripts:app** - runs the "scripts" task with the "app" configuration 
* **copy** - runs every tasks with the prefix "copy"
* **copy:vendors** - runs the "copy" task with the "vendors" configuration
* **copy:app** - runs the "copy" task with the "app" configuration

Note: there are working examples in `test/` and in the `basic-example` branch.

## Documentation

### bucket(taskName, taskFactory, configs)

Register a factory for `taskName` and calls `bucket.addTask()` for each `config` of `configs`.
Also creates a task named after `taskName` that runs every tasks prefixed by `taskName`.

```javascript
import bucket from 'gulp-bucket'
import scripts from './scripts'

bucket('scripts', scripts, [
  { alias: 'vendors', src: 'src/vendors/*.js', dest: 'dist' },
  { alias: 'app', src: 'src/app/*.js', dest: 'dist' }
])
```

### bucket.addTask(taskName, config)

Calls the factory registered under the name of `taskName` to create a task.
The factory receives two arguments: the *config* and *options* objects.

The resulting task's name for a given config object is `<taskName>:<config.alias>` so make sure to provide an alias.

```javascript
import bucket from 'gulp-bucket'
import scripts from './scripts'

bucket('scripts', scripts)
bucket.addTask('scripts', { alias: 'vendors', src: 'src/vendors/*.js', dest: 'dist' })
bucket.addTask('scripts', { alias: 'app', src: 'src/app/*.js', dest: 'dist' })
```

### bucket.options(options)

Getter/setter of **options** (default value is `{}`).
This object is the second argument passed to the task factories.

For example, you could use it to provide options passed from the command line (*argv*).

```javascript
import bucket from 'gulp-bucket'

bucket.options({ env: 'prod' })
```

### bucket.setDefaultTask(tasks)

Accepts an array of tasks and create the default task that's going to run them.
Note: also deeply flatten the array to properly work with `bucket()`.

```javascript
import bucket from 'gulp-bucket'

bucket.setDefaultTask([
  ['scripts', 'scripts:vendors', 'scripts:app']
])
```
