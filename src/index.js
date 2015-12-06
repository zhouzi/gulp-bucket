import _ from 'lodash'
import gulp from 'gulp'
import utils from './lib/utils'
import help from './tasks/help'

let definitions = {}
let options = {}

function bucket (definition, configs) {
  let { name } = definition
  definitions[name] = definition

  utils.createRootTask(gulp, name)

  return addTask(name, configs)
}

function addTask (taskName, configs) {
  if (configs == null) return []
  if (!_.isArray(configs)) configs = [configs]

  let factory = definitions[taskName].factory

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
bucket.getDefinitions = function () { return definitions }

bucket({ name: 'help', factory: help, description: 'Display available tasks' }, {})

export default bucket
