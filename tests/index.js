/* global jasmine, describe, it, expect, spyOn */

import _ from 'lodash'
import gulp from 'gulp'
import bucket from '../src/index'

function getTasks () {
  return _.keys(gulp.tasks)
}

const factory = function () {
  return [
    function () {
      return 'foo'
    }
  ]
}

describe('gulp-bucket', function () {
  it('should have created a help task', function () {
    expect(getTasks()).toEqual(['help'])
  })

  describe('is a function that', function () {
    it('should register a definition', function () {
      let def = { name: 'foo', factory }

      bucket(def)
      expect(bucket.getDefinitions().foo).toBe(def)
    })

    it('should create tasks', function () {
      bucket({ name: 'bar', factory }, [{ alias: 'baz' }])
      bucket({ name: 'abc', factory }, { alias: 'quz' })

      expect(getTasks()).toContain('bar:baz', 'abc:quz')
    })
  })

  describe('has a addTask method that', function () {
    it('should create tasks', function () {
      bucket.addTask('bar', [{ alias: 'aaa' }, { alias: 'bbb' }])
      bucket.addTask('bar', { alias: 'ccc' })

      expect(getTasks()).toContain('bar:aaa', 'bar:bbb', 'bar:ccc')
    })

    it('should calls the factory when adding a task', function () {
      let spy = jasmine.createSpy('factory')

      bucket({ name: 'ddd', factory: spy })

      let config = { alias: 'eee' }
      bucket.addTask('ddd', config)

      expect(spy).toHaveBeenCalledWith(config, bucket.options())
    })

    it('should create an alias from a function', function () {
      bucket.addTask('ddd', { alias () { return 'fn' } })
      expect(getTasks()).toContain('ddd:fn')
    })

    it('should use default alias when it\'s missing', function () {
      bucket({ name: 'fff', factory, alias () { return 'defaultAlias' } }, {})
      expect(getTasks()).toContain('fff', 'fff:defaultAlias')
    })
  })

  describe('has a options method that', function () {
    it('should set and return the value of the options object', function () {
      expect(bucket.options()).toEqual({})

      let options = { foo: 'bar' }
      expect(bucket.options(options)).toBe(options)
    })
  })

  describe('has a setDefaultTask that', function () {
    it('should create a default task', function () {
      expect(gulp.tasks.default).toBeUndefined()

      bucket.setDefaultTask([])

      expect(gulp.tasks.default).not.toBeUndefined()
    })

    it('should flatten the array of dependencies', function () {
      spyOn(gulp, 'task')

      bucket.setDefaultTask([['foo', 'bar'], ['quz', ['baz']]])

      expect(gulp.task).toHaveBeenCalledWith('default', ['foo', 'bar', 'quz', 'baz'])
    })
  })

  describe('has a getTasks method that', function () {
    it('should return the full list of tasks', function () {
      expect(bucket.getTasks()).toEqual(getTasks())
    })

    it('should return tasks with a given prefix', function () {
      bucket({ name: 'eee', factory }, [{ alias: 'hello' }])
      expect(bucket.getTasks('eee:')).toEqual(['eee:hello'])
    })

    it('should filter available tasks with a given function', function () {
      expect(bucket.getTasks((task) => _.startsWith(task, 'eee:'))).toEqual(['eee:hello'])
    })

    it('should return tasks that match a regepx', function () {
      expect(bucket.getTasks(/^eee$/)).toEqual(['eee'])
    })
  })

  describe('has a getTaskName method that', function () {
    it('should return the name for a given prefix and suffix', function () {
      expect(bucket.getTaskName('foo', 'bar')).toBe('foo:bar')
    })

    it('should return the name for a given name and configuration object', function () {
      expect(bucket.getTaskName('eee', { alias: 'foo' })).toBe('eee:foo')
    })
  })
})
