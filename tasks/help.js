require('colors')

var _ = require('lodash')
var bucket = require('../index')

function help () {
  return [
    function (callback) {
      var tasks = bucket.tasks()
      var groups =
        _
          .chain(tasks)
          .reduce(function (groups, taskName) {
            var prefix = taskName.split(':').shift()

            if (groups[prefix] == null) groups[prefix] = []
            groups[prefix].push(taskName)

            return groups
          }, {})
          .reduce(function (groups, value) {
            groups.push(value)
            return groups
          }, [])
          .value()

      _.forEach(groups, function (group) {
        _.forEach(group, function (item) {
          var partials = item.split(':')
          var prefix = partials.shift()
          var suffix = partials.join(':')

          console.log(prefix.bold.cyan + (suffix ? ':' + suffix.magenta : ''))
        })

        console.log('---'.gray)
      })

      callback()
    }
  ]
}

module.exports = help
