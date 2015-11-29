import bucket from '../index'
import uglifyTask from './tasks/uglifyTask'

bucket.options({ env: 'prod' })

bucket.setDefaultTask(
  bucket('scripts', uglifyTask, { alias: 'foo', src: 'tasks/*.js', dest: 'dist' })
)
