import _ from 'lodash'

function getTasks (gulp) {
  return _.keys(gulp.tasks)
}

function hasTask (gulp, taskName) {
  const tasks = getTasks(gulp)
  return _.includes(tasks, taskName)
}

function createRootTask (gulp, taskName) {
  gulp.task(taskName, function () {
    const tasks = getTasks(gulp)
    const matchingTasks = _.filter(tasks, (task) => _.startsWith(task, taskName))
    return gulp.start(matchingTasks)
  })
}

function getTaskName (prefix, config)  {
  let suffix = null

  if (_.isFunction(config.alias)) suffix = config.alias(config)
  if (_.isString(config.alias)) suffix = config.alias

  return suffix ? `${prefix}:${suffix}` : prefix
}

export default { getTasks, hasTask, createRootTask, getTaskName }
