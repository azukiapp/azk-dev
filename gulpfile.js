var gulp  = require('gulp');
var mocha = require('gulp-mocha');
var gutil = require('gulp-util');
var yargs = require('yargs');
var taskListing = require('gulp-task-listing');

gulp.task('spec', function() {
  var mocha_opts = {
    report : 'spec',
    growl  : 'true',
    grep   : yargs.argv.grep,
    timeout: 10000
  };
  return gulp.src('spec/*_spec.js')
    .pipe(mocha(mocha_opts))
    .on('error', gutil.log)
    .on('error', function() { this.emit('end'); });
});

gulp.task('watch-spec', ['spec'], function() {
  return gulp.watch(['*.js', 'spec/**/*.js'], ['spec']);
});

// Add a task to render the output
gulp.task('help', taskListing);
gulp.task('default', ['watch-spec']);
