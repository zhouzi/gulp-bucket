import _ from 'lodash'
import help from './tasks/help'

const options = {}
const definitions = {}
let gulp

function Definition (name, factory) {
  return {
    add (...configs) {
      configs = _.flatten(configs, true)

      if (!configs.length) configs.push({})

      return _.map(configs, function (config) {
        const taskName = api.name(name, config.alias)
        const deps = _(factory(config, api.options())).flatten(true).filter(_.identity).value()
        const fn = _.isFunction(_.last(deps)) ? deps.pop() : _.noop

        gulp.task(taskName, deps, fn)
        return taskName
      })
    }
  }
}

const api = {
  use (_gulp) {
    gulp = _gulp

    api
      .factory('help', help)
      .add()

    return api
  },

  factory (name, factory) {
    if (_.isFunction(factory)) definitions[name] = Definition(name, factory)

    const tasks = api.tasks()
    if (!_.includes(tasks, name)) {
      gulp.task(name, function () {
        gulp.start(api.tasks(name + ':'))
      })
    }

    return definitions[name]
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
  },

  name (prefix, suffix) {
    return suffix ? prefix + ':' + suffix : prefix
  }
}

export default api
