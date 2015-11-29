import gulp from 'gulp'
import uglify from 'gulp-uglify'
import babel from 'gulp-babel'
import concat from 'gulp-concat'
import copyTask from './copyTask'
import bucket from '../../index'

export default function (config, options) {
  console.log(options)

  //let serie = []
  //
  //if (options.env === 'prod') serie.push(copyTask(config))
  //
  //serie.push(function () {})
  //return serie

  return [
    //bucket('copy', copyTask, config),
    //copyTask(config),
    options.env === 'prod' && copyTask(config),
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
