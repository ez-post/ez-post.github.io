'use strict';

var pkg = require('./package.json'),
  gulp = require('gulp'),
  gutil = require('gulp-util'),
  plumber = require('gulp-plumber'),
  connect = require('gulp-connect'),
  server = require('gulp-express'),
  pug = require('gulp-pug'),
  sass = require('gulp-sass'),
  cachebust = require('gulp-cache-bust'),
  runSequence = require('run-sequence'),
  del = require('del'),
  opn = require('opn'),
  through = require('through'),
  webpack = require('webpack-stream'),
  path = require('path'),
  isDist = process.argv.indexOf('default') === -1 && process.argv.indexOf('serve') === -1;

/*
 *
 * WEBPACK converstion functionality
 *
 */
var webpack_func = function() {
  return function() {
    return gulp.src('src/js/*.tsx')
      .pipe(isDist ? through() : plumber())
      .pipe(webpack(require('./webpack.config.js')))
      .pipe(gulp.dest('../ext/js/'))
      .pipe(connect.reload());
  }
};
gulp.task('webpack:html', webpack_func());
gulp.task('webpack', ['webpack:html']);

/*
 *
 * PUG converstion functionality
 *
 */
var pug_func =  function(loc) {
  const location = loc;
  const dest_location = (location==='html' ? '' : location);
  return function() {
    return gulp.src('src/' + location + '/**/*.pug')
      .pipe(isDist ? through() : plumber())
      .pipe(pug({
        pretty: !isDist
      }))
      .pipe(gulp.dest('../' + dest_location))
      .pipe(connect.reload());
  };
};
gulp.task('pug:html', pug_func('html'));
gulp.task('pug', function(callback) {
  runSequence(['pug:html'], callback)
});

/*
 *
 * IMAGE COPIER
 *
 */
var image_func = function(loc) {
  const location = loc;
  return function() {
    return gulp.src(['./src/img/**/*'])
      .pipe(gulp.dest('../ext/img'))
      .pipe(connect.reload());
  };
};
gulp.task('image:html', image_func(''));
gulp.task('image', ['image:html']);

//Basic file copy
gulp.task('copy:favicon', function () {
    return gulp.src(['./src/favicon.ico']).pipe(gulp.dest('../'));
});
gulp.task('copy:robots', function () {
    return gulp.src(['./src/robots.txt']).pipe(gulp.dest('../'));
});
gulp.task('copy', ['copy:favicon', 'copy:robots']);

//Cache Busting for production release
gulp.task('cachebust', function () {
  return gulp.src(['./*.html'])
    .pipe(cachebust({
      type: 'timestamp'
    }))
    .pipe(gulp.dest('./'));
});

//Task connection
gulp.task('connect', function() {
  connect.server({
    root: '/'
  });
});
gulp.task('connect-server', function() {
  server.run(['start.js']);
});
gulp.task('open', ['connect-server', 'connect'], function (done) {
  opn('http://localhost:8000', done);
});

//Task Watcher
gulp.task('watch', function() {
  gulp.watch('src/js/**/*.tsx', ['webpack:html']);
  gulp.watch('src/css/**/*.scss', ['webpack:html']);
  gulp.watch('src/**/*.pug', ['pug']);
  gulp.watch('src/img/', ['image:html']);
});

//Task open to public
gulp.task('build', function(callback) {runSequence('copy', 'image', 'pug', 'webpack', callback)});
gulp.task('serve', function(callback) {runSequence('build', 'open', 'watch')});
gulp.task('default', ['serve']);
