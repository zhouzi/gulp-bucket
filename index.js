import 'colors'
import _ from 'lodash'
import gulp from 'gulp'
import createRootTask from './lib/createRootTask'
import runSerie from './lib/runSerie'

let definitions = {}
let options = {}

function bucket (taskName, taskFactory, configs, parallel = true) {
  definitions[taskName] = taskFactory
  createRootTask(taskName)

  if (configs == null) return null

  return add(taskName, configs, parallel)
}

function add (taskName, config, parallel = true) {
  if (_.isArray(config)) {
    return _.map(config, (c) => add(taskName, c, parallel))
  }

  if (config.alias == null) throw new Error('The config object must have an alias to be used as a suffix')

  let taskAlias = getFullTaskName(taskName, config.alias)
  let taskFactory = definitions[taskName]
  let serie = taskFactory(config, options)
  let namedTasks = []

  if (parallel === true) namedTasks = _.remove(serie, _.isString)

  gulp.task(taskAlias, namedTasks, callback => runSerie(serie, callback, parallel))
  return taskAlias
}

function getFullTaskName (...partials) {
  return partials.join(':')
}

bucket.add = add

bucket.options = function () {
  if (arguments.length) options = arguments[0]
  return options
}

bucket.setDefaultTask = function (...tasks) {
  tasks = _.flatten(tasks)
  gulp.task('default', tasks)

  return tasks
}

gulp.task('help', function (callback) {
  let tasks = _.keys(gulp.tasks)
  let groups =
    _
      .chain(tasks)
      .reduce(function (groups, taskName) {
        let prefix = taskName.split(':').shift()

        if (groups[prefix] == null) groups[prefix] = []
        groups[prefix].push(taskName)

        return groups
      }, {})
      .reduce(function (groups, value) {
        groups.push(value)
        return groups
      }, [])
      .value()

  _.forEach(groups, group => {
    _.forEach(group, function (item) {
      let partials = item.split(':')
      let prefix = partials.shift().bold.cyan
      let suffix =
        partials.length
          ? ':' + partials.join(':').magenta
          : ''

      console.log(prefix + suffix)
    })

    console.log('---'.gray)
  })

  callback()
});

export default bucket
