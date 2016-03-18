var _ = require('lodash')

var opts = {}
var definitions = {}
var gulp

function Definition (factoryName, factory) {
  return {
    add: function add () {
      var configs = _.toArray(arguments)
      configs = _.flatten(configs, true)

      if (!configs.length) {
        configs.push({})
      }

      return _.map(configs, function (config) {
        var taskName = name(factoryName, config.alias)
        var deps = _(factory(config, options())).flatten(true).filter(_.identity).value()
        var fn = _.isFunction(_.last(deps)) ? deps.pop() : _.noop

        gulp.task(taskName, deps, fn)
        return taskName
      })
    }
  }
}

function use (_gulp) {
  gulp = _gulp
  factory('help', require('./help')).add()
  return this
}

function factory (factoryName, factory) {
  if (_.isFunction(factory)) {
    definitions[factoryName] = Definition(factoryName, factory)
  }

  var taskList = tasks()

  if (!_.includes(taskList, factoryName)) {
    gulp.task(factoryName, function () {
      gulp.start(tasks(factoryName + ':'))
    })
  }

  return definitions[factoryName]
}

function main () {
  var taskList = _.toArray(arguments)
  gulp.task('default', _.flatten(taskList, true))
  return this
}

function options () {
  if (arguments.length) _.assign(opts, _.first(arguments))
  else return opts

  return this
}

function tasks (taskName) {
  var taskList = _.keys(gulp.tasks)

  if (taskName == null) {
    return taskList
  }

  return _.filter(taskList, function (task) {
    return _.startsWith(task, taskName)
  })
}

function name (prefix, suffix) {
  return suffix ? prefix + ':' + suffix : prefix
}

module.exports = {
  use: use,
  factory: factory,
  main: main,
  options: options,
  tasks: tasks,
  name: name
}
