import _ from 'lodash'
import gulp from 'gulp'
import utils from './lib/utils'
import help from './tasks/help'

let factories = {}
let options = {}

function bucket (taskName, taskFactory, configs = [{}]) {
  factories[taskName] = taskFactory
  utils.createRootTask(gulp, taskName)

  return addTask(taskName, configs)
}

function addTask (taskName, configs) {
  if (!_.isArray(configs)) configs = [configs]

  return _.map(configs, function (config) {
    let factory = factories[taskName]
    let sequence = _.flatten(factory(config, options), true)
    let task = sequence.pop()
    let deps = _.filter(sequence, _.isString)

    taskName = utils.getTaskName(taskName, config)

    gulp.task(taskName, deps, task)
    return taskName
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
bucket('help', help)

export default bucket
