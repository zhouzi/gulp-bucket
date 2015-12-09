# gulp-bucket

Maximize gulp tasks reusability.

## Example

### Structure

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

### gulpfile.babel.js

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

### gulp/config.json

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

### gulp/tasks/lint.js

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

### gulp/tasks/scripts.js

```javascript
import gulp from 'gulp'
import bucket from 'gulp-bucket'
import uglify from 'gulp-uglify'
import lint from './lint'

export default function (config, options) {
  return [
    config.lint !== false ? bucket.factory('lint', lint).add(config) : null,
    function () {
      const stream = gulp.src(config.src)
      
      if (options.build === true) stream.pipe(uglify())
      
      stream.pipe(gulp.dest(config.dest))
      return stream
    }
  ]
}
```

### gulp/tasks/styles.js

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

### gulp/tasks/watch.js

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

### output

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
