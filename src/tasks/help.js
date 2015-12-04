import 'colors'

import _ from 'lodash'
import gulp from 'gulp'
import utils from '../lib/utils'

export default function () {
  return [
    function (callback) {
      let tasks = utils.getTasks(gulp)
      let groups =
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
          let partials = item.split(':')
          let prefix = partials.shift().bold.cyan
          let suffix =
            partials.length
              ? ':' + partials.join(':').magenta
              : ''

          console.log(prefix + suffix)
        })

        console.log('---'.gray)
      })

      callback()
    }
  ]
}
