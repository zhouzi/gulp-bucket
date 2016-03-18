var gulp = require('gulp')
var bucket = require('../index')
var scripts = require('./tasks/scripts')

bucket
  .use(gulp)
  .options({ env: 'prod' })

bucket.main(
  bucket
    .factory('scripts', scripts)
    .add({ alias: 'foo', src: 'tasks/*.js', dest: 'dist' })
)
