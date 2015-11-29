import _ from 'lodash'
import q from 'q'
import gulp from 'gulp'

export default function (task) {
  let deferred = q.defer()

  if (_.isString(task)) {
    let onTaskStop

    onTaskStop = function () {
      gulp.removeListener('task_stop', onTaskStop)
      deferred.resolve()
    }

    gulp.on('task_stop', onTaskStop)
    gulp.start(task)

    return deferred.promise
  }

  let stream = task(deferred.resolve)
  if (stream != null && stream.on) stream.on('end', deferred.resolve)

  return deferred.promise
}
