# gulp-bucket

Highly reusable gulp task definition.

* [Introduction](https://github.com/Zhouzi/gulp-bucket#introduction)
* [Install](https://github.com/Zhouzi/gulp-bucket#install)
* [Example](https://github.com/Zhouzi/gulp-bucket#example)
* [Documentation](https://github.com/Zhouzi/gulp-bucket#documentation)
* [Change Log](https://github.com/Zhouzi/gulp-bucket#change-log)

## Introduction

Let's consider a common workflow: you have a task that does some stuff to JavaScript files and outputs `bundle-1.js`.
But then, you want to use the same pipeline to output `bundle-2.js`.
To do so, you'll have to whether duplicate the code or go through some kind of `.forEach()` to iterate on a list of configurations.

This is what gulp-bucket wants to solve.
Instead of writing tasks, it allows you to define factory functions that create tasks from a configuration and option object.
It also helps you to manage tasks dependencies "on-the-fly" by following some common "DI" patterns.

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

Register a factory for `taskName` and calls `bucket.addTask()` by passing `configs` to it.
Also creates a task named after `taskName` that runs every tasks prefixed by `taskName`.

```javascript
import bucket from 'gulp-bucket'
import scripts from './scripts'

bucket('scripts', scripts, [
  { alias: 'vendors', src: 'src/vendors/*.js', dest: 'dist' },
  { alias: 'app', src: 'src/app/*.js', dest: 'dist' }
])
```

### bucket.addTask(taskName, configs)

Calls the factory registered under the name of `taskName` to create a task for each config of `configs`.
The factory receives two arguments: the *config* and *options* objects.

The resulting task's name for a given config object is `<taskName>:<config.alias>` where `config.alias` can be of two types:

* **string**: used as a suffix
* **function**: return value is used as a suffix (the function is called when creating the task and receives the config object as only argument)

If the config object misses an alias, the task's name would be `<taskName>` (overwriting the "root" task).

```javascript
import bucket from 'gulp-bucket'
import scripts from './scripts'

bucket('scripts', scripts)
bucket.addTask('scripts', { alias: 'vendors', src: 'src/vendors/*.js', dest: 'dist' })
bucket.addTask('scripts', { alias: 'app', src: 'src/app/*.js', dest: 'dist' })
```

### bucket.addTasks(taskName, configs)

Alias of `bucket.addTask()`.

### bucket.options(options)

Getter/setter of **options** (default value is `{}`).
This object is the second argument passed to the task factories.

*This is something you could use it to provide options passed from the command line (*argv*).*

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

## Change Log

### 1.0.0 - Unreleased

* [x] fix "root" task to properly run matching tasks
* [x] **addTask():** also accepts an array
  * [x] add `addTasks()` as an alias of `addTask()`
* [x] **config.alias:** can be of two types
  * [x] string: task name's suffix
  * [x] function: the return value is used as the suffix (the function is called on the creation of the task and receives a config object)
* [ ] **bucket():** third argument is now a "config" object
  * [ ] `config.description`: displayed by the "help" task
  * [ ] `config.alias`: default alias, used when a config object misses an alias property
  * [ ] no more add tasks but returns the api
* [x] improve "test suite"

### 0.0.3 - 2015-12-05

*First tracked release...*
