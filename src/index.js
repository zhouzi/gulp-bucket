import _ from 'lodash'
import gulp from 'gulp'
import utils from './lib/utils'
import help from './tasks/help'

const definitions = {}
let options = {}

function bucket (definition, configs) {
  const { name } = definition
  definitions[name] = definition

  gulp.task(name, () => gulp.start(getTasks(name)))

  return addTask(name, configs)
}

function addTask (taskName, configs) {
  if (configs == null) return []
  if (!_.isArray(configs)) configs = [configs]

  const { alias, factory } = definitions[taskName]

  return _.map(configs, function (config) {
    const sequence = _.flatten(factory(config, options), true)
    const task = sequence.pop()
    const deps = _.filter(sequence, _.isString)
    const fullTaskName = utils.getTaskName(taskName, _.assign({ alias }, config))

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

function getTasks (prefix) {
  const tasks = _.keys(gulp.tasks)

  if (prefix == null) return tasks

  if (_.isString(prefix)) {
    return _.filter(tasks, (task) => _.startsWith(task, prefix))
  }

  if (_.isFunction(prefix)) {
    return _.filter(tasks, prefix)
  }

  return []
}

bucket.addTask = bucket.addTasks = addTask
bucket.options = setOptions
bucket.setDefaultTask = setDefaultTask
bucket.getDefinitions = () => definitions
bucket.getTasks = getTasks

bucket({ name: 'help', factory: help, description: 'Display available tasks' }, {})

export default bucket
