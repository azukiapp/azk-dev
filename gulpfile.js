var gulp  = require('gulp');
var mocha = require('gulp-mocha');
var gutil = require('gulp-util');
var yargs = require('yargs');
var taskListing = require('gulp-task-listing');

gulp.task('screen-clean', function() {
  process.stdout.write('\u001B[2J\u001B[0;0f');
});

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

var spec_tasks = ['screen-clean', 'spec'];
gulp.task('watch-spec', spec_tasks, function() {
  var src = ['./*.js', 'spec/*.js', 'spec/fixtures/!(lib)/*.js'];
  gulp.watch(src, spec_tasks);
});

// Add a task to render the output
gulp.task('help', taskListing);
gulp.task('default', ['watch-spec']);
