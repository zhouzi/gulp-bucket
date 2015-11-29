import _ from 'lodash'
import gulp from 'gulp'

export default function (taskName) {
  let tasks = _.keys(gulp.tasks)
  if (_.includes(tasks, taskName)) return

  gulp.task(taskName, function () {
    let tasks = _.keys(gulp.tasks)
    let matchingTasks = tasks.filter(task => task.indexOf(taskName) === 0)
    return gulp.start(matchingTasks)
  })
}
