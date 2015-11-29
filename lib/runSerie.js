import _ from 'lodash'
import async from 'async'
import runTask from './runTask'

function runSerie (deps, callback, parallel = true) {
  let finalTask = deps.pop()
  let serie =
    _(deps)
      // this is to allow passing falsy value as dependency
      // useful for those cases: argv.build ? uglify(config) : null
      .filter(dep => Boolean(dep))
      .map(dep => function (nextTaskInSerie) {
        if (_.isArray(dep)) {
          runSerie(dep, nextTaskInSerie, parallel)
          return
        }

        runTask(dep).then(nextTaskInSerie)
      })
      .value()

  let asyncMethod = parallel === true ? 'parallel' : 'series'
  async[asyncMethod](serie, () => runTask(finalTask).then(callback))
}

export default runSerie
