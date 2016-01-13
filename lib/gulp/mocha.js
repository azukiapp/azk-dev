
module.exports = function(azk_gulp) {
  var src_opts = { read: false, cwd: azk_gulp.config.cwd };
  var src = azk_gulp.config.spec.dest + '/**/*_spec.js';

  var isEmpty = function(value) {
    return value == null
  }

  azk_gulp.new_task('test', ['babel'], function() {
    process.env.NODE_ENV = process.env.NODE_ENV || "test";
    var argv = azk_gulp.yargs.argv
    var opts = {
      reporter: 'spec',
      invert  : argv.invert,
      grep    : argv.grep,
      timeout : argv.timeout,
    };

    if (argv.slow) {
      var warning = require('../warning');
      warning(
        'DEPRECATE ALERT!!',
        '`--slow` this deprecation, by default all tests are run, check `--skip-slow`'
      );
    }

    var skip_slow = argv['skip-slow'];
    if (skip_slow) {
      if (opts.invert || !isEmpty(opts.grep)) {
        console.log('--skip-slow is incompatible with reverse and grep');
        process.exit(1);
      }

      opts.grep   = '@slow';
      opts.invert = true;
    }

    azk_gulp.gutil.log("Running mocha with:", opts);

    azk_gulp.gulp.src(src, src_opts)
      .pipe(azk_gulp.watching ? azk_gulp.plumber() : azk_gulp.gutil.noop())
      .pipe(azk_gulp.mocha(opts));
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
