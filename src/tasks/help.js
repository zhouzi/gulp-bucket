import 'colors'

import _ from 'lodash'
import gulp from 'gulp'
import bucket from '../index'
import utils from '../lib/utils'

export default function () {
  return [
    function (callback) {
      let definitions = bucket.getDefinitions()
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
          let prefix = partials.shift()
          let suffix = partials.length ? ':' + partials.join(':') : ''

          let definition = definitions[prefix]
          let desc = ''

          if (definition && definition.description) {
            desc += ` - ${definitions[prefix].description}`
          }

          console.log(prefix.bold.cyan + suffix.magenta + desc)
        })

        console.log('---'.gray)
      })

      callback()
    }
  ]
}
