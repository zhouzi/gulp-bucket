import _ from 'lodash'
import bucket from '../index'

function getTaskName (prefix, config) {
  let suffix = null

  if (_.isFunction(config.alias)) suffix = config.alias(config)
  if (_.isString(config.alias)) suffix = config.alias

  return suffix ? `${prefix}:${suffix}` : prefix
}

export default { getTaskName }
