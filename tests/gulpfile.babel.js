import gulp from 'gulp'
import bucket from '../src/index'
import scripts from './tasks/scripts'

bucket
  .use(gulp)
  .options({ env: 'prod' })

bucket.main(
  bucket
    .factory('scripts', scripts)
    .add({ alias: 'foo', src: 'tasks/*.js', dest: 'dist' })
)
