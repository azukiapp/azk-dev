var help        = require('gulp-help');
var mocha       = require('gulp-mocha');
var gutil       = require('gulp-util');
var plumber     = require('gulp-plumber');
var runSequence = require('run-sequence');
var yargs       = require('yargs');

var gulp  = help(require('gulp'), {
  description: 'you are looking at it.',
  aliases: ['h', '?']
});

gulp.task('screen:clean', function() {
  process.stdout.write('\u001B[2J\u001B[0;0f');
});

var watching = false;

gulp.task('test', function() {
  var mocha_opts = {
    report : 'spec',
    growl  : 'true',
    grep   : yargs.argv.grep,
    timeout: 10000
  };
  return gulp.src('spec/*_spec.js')
    .pipe(watching ? plumber() : gutil.noop())
    .pipe(mocha(mocha_opts))
});

gulp.task('watch:test:sequence', function() {
  runSequence('screen:clean', 'test')
});

gulp.task('watch:test', function() {
  var src  = ['./*.js', 'spec/*.js', 'spec/fixtures/!(lib)/*.js'];
  var task = 'watch:test:sequence';
  watching = true;
  runSequence(task, function() { gulp.watch(src, [task]); });
});

// Add a task to render the output
gulp.task('default', ['watch:test']);
