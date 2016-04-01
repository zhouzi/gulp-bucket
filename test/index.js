/* global describe, beforeEach, it */

var _ = require('lodash')
var assert = require('assert')
var sinon = require('sinon')

var gulp = {
  tasks: {},
  task: function task (name, deps, fn) {
    if (_.isFunction(deps)) {
      fn = deps
      deps = []
    }

    this.tasks[name] = { deps, fn }
  },
  start () {}
}

var proxyquire = require('proxyquire')
var bucket = proxyquire('../index', { gulp: gulp })

describe('gulp-bucket', function () {
  beforeEach(function () {
    gulp.tasks = {}
  })

  describe('has a factory function that', function () {
    it('should return a definition', function () {
      assert.deepEqual(_.keys(bucket.factory('foo', _.noop)), ['add'])
    })

    it('should create a task that runs every tasks created from a given factory', function () {
      sinon.spy(gulp, 'start')

      bucket
        .factory('foo', function () {})
        .add({ alias: 'bar' }, { alias: 'quz' })

      gulp.tasks.foo.fn()
      assert.deepEqual(gulp.start.getCall(0).args, [['foo:bar', 'foo:quz']])
    })

    describe('has a add function that', function () {
      it('should return the names of the created tasks', function () {
        assert.deepEqual(bucket.factory('foo', function () {}).add({ alias: 'bar' }), ['foo:bar'])
      })

      it('should call a factory for each config of configs', function () {
        var spy = sinon.spy()

        bucket
          .factory('foo', spy)
          .add({ alias: 'bar' }, { alias: 'quz' }, [{ alias: 'foo' }])

        assert.equal(spy.called, true)
      })

      it('should create a task and filter out falsy dependencies', function () {
        bucket
          .factory('foo', function () { return [null, '', false, 'quz:baz', 0] })
          .add({ alias: 'bar' })

        assert.deepEqual(gulp.tasks['foo:bar'].deps, ['quz:baz'])
      })

      it('should overwrite the main task if alias is missing', function () {
        bucket.factory('foo', function () { return ['bar:foo'] })
        assert.deepEqual(gulp.tasks.foo.deps, [])

        bucket.factory('foo').add()
        assert(gulp.tasks.foo.deps, ['bar:foo'])
      })

      it('should return created tasks but not their dependencies', function () {
        var foo = function () { return [_.noop] }
        var bar = function (c) { return [bucket.factory('foo', foo).add(c), _.noop] }

        assert.deepEqual(bucket.factory('bar', bar).add({ alias: 'quz' }), ['bar:quz'])
        assert.deepEqual(gulp.tasks['bar:quz'].deps, ['foo:quz'])
      })
    })
  })

  describe('has a main function that', function () {
    it('should return the api', function () {
      assert.deepEqual(bucket.main(), bucket)
    })

    it('should create a default task from an array of task names', function () {
      bucket.main(['foo'])
      assert.deepEqual(gulp.tasks.default.deps, ['foo'])
    })
  })

  describe('has a options function that', function () {
    it('should return the options', function () {
      assert.deepEqual(bucket.options(), {})
    })

    it('should merge the options and return the api', function () {
      assert.deepEqual(bucket.options({ foo: 'bar' }), bucket)
      assert.deepEqual(bucket.options(), { foo: 'bar' })

      bucket.options({ zup: 'zip' })
      assert.deepEqual(bucket.options(), { foo: 'bar', zup: 'zip' })
    })
  })

  describe('has a tasks function that', function () {
    beforeEach(function () {
      bucket.factory('foo', function () {})
    })

    it('should return all the tasks', function () {
      bucket.factory('foo').add({ alias: 'bar' }, { alias: 'quz' })
      assert.deepEqual(bucket.tasks(), ['foo', 'foo:bar', 'foo:quz'])
    })

    it('should return all the tasks prefixed by name', function () {
      bucket.factory('foo').add({ alias: 'bar' }, { alias: 'quz' })
      assert.deepEqual(bucket.tasks('foo:'), ['foo:bar', 'foo:quz'])
      assert.deepEqual(bucket.tasks('foo:q'), ['foo:quz'])
    })
  })

  describe('has a name function that', function () {
    it('should return a concatenated task name', function () {
      assert.deepEqual(bucket.name('foo', 'bar'), 'foo:bar')
    })

    it('should return a simple task name when suffix is not provided', function () {
      assert.deepEqual(bucket.name('foo'), 'foo')
      assert.deepEqual(bucket.name('foo', null), 'foo')
      assert.deepEqual(bucket.name('foo', undefined), 'foo')
      assert.deepEqual(bucket.name('foo', ''), 'foo')
    })
  })
})
