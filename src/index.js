import _ from 'lodash'
import gulp from 'gulp'
import utils from './lib/utils'
import help from './tasks/help'

let factories = {}
let options = {}

function bucket (taskName, taskFactory, configs) {
  factories[taskName] = taskFactory
  utils.createRootTask(gulp, taskName)

  return addTask(taskName, configs)
}

function addTask (taskName, configs) {
  if (configs == null) return []
  if (!_.isArray(configs)) configs = [configs]

  let factory = factories[taskName]

  return _.map(configs, function (config) {
    let sequence = _.flatten(factory(config, options), true)
    let task = sequence.pop()
    let deps = _.filter(sequence, _.isString)
    let fullTaskName = utils.getTaskName(taskName, config)

    gulp.task(fullTaskName, deps, task)
    return fullTaskName
  })
}

function setOptions () {
  if (arguments.length) options = arguments[0]
  return options
}

function setDefaultTask (...deps) {
  gulp.task('default', _.flatten(deps, true))
}

bucket.addTask = bucket.addTasks = addTask
bucket.options = setOptions
bucket.setDefaultTask = setDefaultTask
bucket.getDefinitions = function () { return factories }

bucket('help', help, {})

export default bucket
