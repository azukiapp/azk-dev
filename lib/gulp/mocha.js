
module.exports = function(azk_gulp) {
  var src_opts = { read: false, cwd: azk_gulp.config.cwd };
  var src = azk_gulp.config.spec.dest + '/**/*_spec.js';

  azk_gulp.new_task('test', ['babel'], function() {
    process.env.NODE_ENV = process.env.NODE_ENV || "test";
    var mocha_opts = {
      reporter: 'spec',
      // growl: 'true',
      invert : azk_gulp.yargs.argv.slow ? false : azk_gulp.yargs.argv.invert,
      grep   : azk_gulp.yargs.argv.slow ? null  : azk_gulp.yargs.argv.grep,
      timeout: azk_gulp.yargs.argv.slow ? azk_gulp.config.mocha.slow_timeout || 50000 : azk_gulp.yargs.argv.timeout,
    };

    azk_gulp.gutil.log("Running mocha with:", mocha_opts);

    azk_gulp.gulp.src(src, src_opts)
      .pipe(azk_gulp.watching ? azk_gulp.plumber() : azk_gulp.gutil.noop())
      .pipe(azk_gulp.mocha(mocha_opts));
  });

  var watch_tasks = {
    'watch:test'     : ['screen:clean', 'test'],
    'watch:test:lint': ['screen:clean', 'test', 'lint'],
    'watch:lint:test': ['screen:clean', 'lint', 'test'],
  };

  Object.keys(watch_tasks).forEach(function(task) {
    var src = [
      azk_gulp.config.src.src  + '/**/*.js',
      azk_gulp.config.spec.src + '/**/*.js',
    ];
    azk_gulp.new_watch(task, src, { cwd: azk_gulp.config.cwd }, watch_tasks[task]);
  });
};
