import _ from 'lodash'
import help from './tasks/help'

const options = {}
const definitions = {}
let current
let gulp

const api = {
  use (_gulp) {
    gulp = _gulp

    api
      .factory('help', help)
      .add()

    return api
  },

  factory (name, factory) {
    if (_.isFunction(factory)) definitions[name] = { name, factory }
    current = definitions[name]

    const tasks = api.tasks()
    if (!_.includes(tasks, name)) {
      gulp.task(name, function () {
        gulp.start(api.tasks(name + ':'))
      })
    }

    return api
  },

  add (...configs) {
    configs = _.flatten(configs, true)
    if (!configs.length) configs.push({})

    return _.map(configs, function (config) {
      const taskName = current.name + (config.alias ? ':' + config.alias : '')
      const deps = _.flatten(current.factory(config, api.options()), true)
      const fn = _.isFunction(_.last(deps)) ? deps.pop() : _.noop

      gulp.task(taskName, deps, fn)
      return taskName
    })
  },

  main (...tasks) {
    gulp.task('default', _.flatten(tasks, true))
    return api
  },

  options () {
    if (arguments.length) _.assign(options, _.first(arguments))
    else return options

    return api
  },

  tasks (name) {
    const tasks = _.keys(gulp.tasks)

    if (name == null) return tasks

    return _.filter(tasks, (task) => _.startsWith(task, name))
  }
}

export default api
