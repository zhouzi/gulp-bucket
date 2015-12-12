/* global describe, beforeEach, it, expect, spyOn, jasmine */

import _ from 'lodash'
import bucket from '../src/index'

let gulp

describe('gulp-bucket', function () {
  beforeEach(function () {
    gulp = {
      tasks: {},
      task (name, deps, fn) {
        if (_.isFunction(deps)) {
          fn = deps
          deps = []
        }

        this.tasks[name] = { deps, fn }
      },
      start () {}
    }

    bucket.use(gulp)
  })

  it('should have created a help task after .use()', function () {
    expect(_.keys(gulp.tasks)).toEqual(['help'])
  })

  describe('has a factory function that', function () {
    it('should return a definition', function () {
      expect(_.keys(bucket.factory('foo', _.noop))).toEqual(['add'])
    })

    it('should create a task that runs every tasks created from a given factory', function () {
      spyOn(gulp, 'start')

      bucket
        .factory('foo', function () {})
        .add({ alias: 'bar' }, { alias: 'quz' })

      gulp.tasks.foo.fn()
      expect(gulp.start).toHaveBeenCalledWith(['foo:bar', 'foo:quz'])
    })
  })

  describe('has a add function that', function () {
    it('should return the names of the created tasks', function () {
      expect(bucket.factory('foo', function () {}).add({ alias: 'bar' })).toEqual(['foo:bar'])
    })

    it('should call a factory for each config of configs', function () {
      const spy = jasmine.createSpy()

      bucket
        .factory('foo', spy)
        .add({ alias: 'bar' }, { alias: 'quz' }, [{ alias: 'foo' }])

      expect(spy.calls.length).toBe(3)
    })

    it('should create a task and filter out falsy dependencies', function () {
      bucket
        .factory('foo', function () { return [null, '', false, 'quz:baz', 0] })
        .add({ alias: 'bar' })

      expect(gulp.tasks['foo:bar'].deps).toEqual(['quz:baz'])
    })

    it('should overwrite the main task if alias is missing', function () {
      bucket.factory('foo', () => ['bar:foo'])
      expect(gulp.tasks.foo.deps).toEqual([])

      bucket.factory('foo').add()
      expect(gulp.tasks.foo.deps).toEqual(['bar:foo'])
    })

    it('should return created tasks but not their dependencies', function () {
      const foo = () => [_.noop]
      const bar = (c) => [bucket.factory('foo', foo).add(c), _.noop]

      expect(bucket.factory('bar', bar).add({ alias: 'quz' })).toEqual(['bar:quz'])
      expect(gulp.tasks['bar:quz'].deps).toEqual(['foo:quz'])
    })
  })

  describe('has a main function that', function () {
    it('should return the api', function () {
      expect(bucket.main()).toBe(bucket)
    })

    it('should create a default task from an array of task names', function () {
      bucket.main(['foo'])
      expect(gulp.tasks.default.deps).toEqual(['foo'])
    })
  })

  describe('has a options function that', function () {
    it('should return the options', function () {
      expect(bucket.options()).toEqual({})
    })

    it('should merge the options and return the api', function () {
      expect(bucket.options({ foo: 'bar' })).toBe(bucket)
      expect(bucket.options()).toEqual({ foo: 'bar' })

      bucket.options({ zup: 'zip' })
      expect(bucket.options()).toEqual({ foo: 'bar', zup: 'zip' })
    })
  })

  describe('has a tasks function that', function () {
    beforeEach(function () {
      bucket.factory('foo', function () {})
    })

    it('should return all the tasks', function () {
      bucket.factory('foo').add({ alias: 'bar' }, { alias: 'quz' })
      expect(bucket.tasks()).toEqual(['help', 'foo', 'foo:bar', 'foo:quz'])
    })

    it('should return all the tasks prefixed by name', function () {
      bucket.factory('foo').add({ alias: 'bar' }, { alias: 'quz' })
      expect(bucket.tasks('foo:')).toEqual(['foo:bar', 'foo:quz'])
      expect(bucket.tasks('foo:q')).toEqual(['foo:quz'])
    })
  })

  describe('has a name function that', function () {
    it('should return a concatenated task name', function () {
      expect(bucket.name('foo', 'bar')).toBe('foo:bar')
    })

    it('should return a simple task name when suffix is not provided', function () {
      expect(bucket.name('foo')).toBe('foo')
      expect(bucket.name('foo', null)).toBe('foo')
      expect(bucket.name('foo', undefined)).toBe('foo')
      expect(bucket.name('foo', '')).toBe('foo')
    })
  })
})
