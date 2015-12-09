# gulp-bucket

Maximize gulp tasks reusability.

## Example

```javascript
import gulp from 'gulp'
import bucket from 'gulp-bucket'
import gulpEslint from 'gulp-eslint'
import gulpUglify from 'gulp-uglify'
import gulpIf from 'gulp-if'

const lint = function (config) {
  return [
    function () {
      return gulp
        .src(config.src)
        .pipe(gulpEslint({ configFile: 'eslint.json' })))
        .pipe(gulpEslint.format())
        .pipe(gulpEslint.failAfterError())
    }
  ]
}

const scripts = function (config, options) {
  return [
    options.lint !== false ? bucket.factory('lint', lint).add(config) : null,
    function () {
      return gulp
        .src(config.src)
        .pipe(gulpIf(options.env === 'prod', gulpUglify()))
        .pipe(gulp.dest(config.dest))
    }
  ]
}

bucket
  .use(gulp)
  .options({ env: 'prod' })

bucket.main(
  bucket
    .factory('scripts', scripts)
    .add([
      { src: 'src/vendors/*.js', dest: 'dist', lint: false },
      { src: 'src/app/*.js', dest: 'dist' }
    ])
)
```
