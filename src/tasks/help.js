import 'colors'

import _ from 'lodash'
import bucket from '../index'

export default function () {
  return [
    function (callback) {
      const tasks = bucket.tasks()
      const groups =
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
          const partials = item.split(':')
          const prefix = partials.shift()
          const suffix = partials.join(':')

          console.log(prefix.bold.cyan + (suffix ? ':' + suffix.magenta : ''))
        })

        console.log('---'.gray)
      })

      callback()
    }
  ]
}
