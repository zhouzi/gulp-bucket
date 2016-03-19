var bucket = require('../index')
var help = require('../tasks/help')
var scripts = require('./tasks/scripts')

bucket
  .options({ env: 'prod' })

bucket
  .factory('help', help)
  .add()

bucket.main(
  bucket
    .factory('scripts', scripts)
    .add({ alias: 'foo', src: 'tasks/*.js', dest: 'dist' })
)
