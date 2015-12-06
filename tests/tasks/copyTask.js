import gulp from 'gulp'

export default function (config) {
  return [
    function () {
      return gulp
        .src(config.src)
        .pipe(gulp.dest(config.dest))
    }
  ]
}
