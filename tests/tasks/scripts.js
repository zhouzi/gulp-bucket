import gulp from 'gulp'
import uglify from 'gulp-uglify'
import babel from 'gulp-babel'
import concat from 'gulp-concat'
import copyTask from './copyTask'
import bucket from '../../src/index'

export default function (config, options) {
  return [
    options.env === 'prod' && bucket({ name: 'copy', factory: copyTask }, config),
    function () {
      return gulp
        .src(config.src)
        .pipe(babel({ presets: ['es2015'] }))
        .pipe(concat('bundle.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest(config.dest))
    }
  ]
}
