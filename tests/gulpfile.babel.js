import bucket from '../src/index'
import scripts from './tasks/scripts'

bucket.options({ env: 'prod' })

bucket.setDefaultTask([
  bucket({ name: 'scripts', factory: scripts }, { alias: () => 'foo', src: 'tasks/*.js', dest: 'dist' })
])
