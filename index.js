var _ = require('lodash')
var gulp = require('gulp')

var opts = {}
var definitions = {}

/**
 * Return a Definition object that's used to create
 * tasks from a given factory.
 *
 * @param {String} factoryName
 * @param {Function} factory
 * @returns {{add: add}}
 */
function Definition (factoryName, factory) {
  return {
    /**
     * Calls the factory for each arguments and returns
     * the list of tasks that just got created.
     *
     * @params {Object}
     * @returns {Array}
     */
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

/**
 * Getter/setter that create and register a Definition
 * if factory is provided or return the existing one if not.
 * When creating a Definition, also add a gulp task that runs
 * every tasks created with this Definition.
 *
 * @param {String} factoryName
 * @param {Function} factory
 * @returns {Object} Definition
 */
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

/**
 * Create gulp's default task that runs every tasks
 * passed as arguments.
 *
 * @params array of strings
 * @returns {bucket}
 */
function main () {
  var taskList = _.toArray(arguments)
  gulp.task('default', _.flatten(taskList, true))
  return this
}

/**
 * Getter/setter that whether add the provided options
 * to the existing ones or return them.
 * When setting options, this function returns the api
 * so you're able to chain other functions.
 *
 * @returns {*}
 */
function options () {
  if (arguments.length) _.assign(opts, _.first(arguments))
  else return opts

  return this
}

/**
 * Returns every gulp tasks with a name that starts by taskName
 * if provided, otherwise returns all existing tasks.
 *
 * @param {String} taskName
 * @returns {Array}
 */
function tasks (taskName) {
  var taskList = _.keys(gulp.tasks)

  if (taskName == null) {
    return taskList
  }

  return _.filter(taskList, function (task) {
    return _.startsWith(task, taskName)
  })
}

/**
 * Returns a task name based on its Definition creator and alias.
 * If alias is not provided, returns the Definition name.
 *
 * @param {String} definitionName
 * @param {String} alias
 * @returns {String}
 */
function name (definitionName, alias) {
  return alias ? definitionName + ':' + alias : definitionName
}

module.exports = {
  factory: factory,
  main: main,
  options: options,
  tasks: tasks,
  name: name
}
