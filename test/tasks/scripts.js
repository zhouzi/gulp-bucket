var gulp = require('gulp')
var uglify = require('gulp-uglify')
var concat = require('gulp-concat')
var copyTask = require('./copyTask')
var bucket = require('../../index')

module.exports = function scripts (config, options) {
  return [
    options.env === 'prod'
      ? bucket.factory('copy', copyTask).add(config)
      : null,
    function () {
      return gulp
        .src(config.src)
        .pipe(concat('bundle.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(config.dest))
    }
  ]
}
