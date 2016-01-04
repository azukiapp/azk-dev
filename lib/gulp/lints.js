var fs   = require('fs');
var path = require('path');

module.exports = function(azk_gulp) {
  var src_opts = { cwd: azk_gulp.config.cwd };
  var dotfiles = {
    jshintrc : path.join(azk_gulp.shared_path, '.jshintrc'),
    jscsrc   : path.join(azk_gulp.shared_path, '.jscsrc'),
  }

  var paths = azk_gulp.config.lint;
  paths.push(azk_gulp.config.src.src  + '/**/*.js');
  paths.push(azk_gulp.config.spec.src + '/**/*.js');

  // Default or project .jshintrc
  var jshintrc = path.join(azk_gulp.config.cwd + '.jshintrc');
  if (!fs.existsSync(jshintrc)) { jshintrc = dotfiles.jshintrc; }

  // Default or project .jscsrc
  var jscsrc = path.join(azk_gulp.config.cwd + '.jscsrc');
  if (!fs.existsSync(jscsrc)) { jscsrc = dotfiles.jscsrc; }

  var _makeLintCache = function(module, lintfile) {
    // var azk_gulp    = this;
    var version   = require('gulp-' + module + '/package.json').version;
    var lint_opts = fs.readFileSync(lintfile);

    return azk_gulp.cache(azk_gulp[module](lintfile), {
      // cache: azk_gulp.cache.Cache({ cacheDirName: 'jshint' }),
      key: function(file) {
        // Key off the file contents, jshint version and options
        return [file.contents.toString('utf8'), version, lint_opts].join('');
      },
      // What on the result indicates it was successful
      success: function (hintedfile) {
        return hintedfile[module].success;
      },
      // What to store as the result of the successful action
      value: function(hintedfile) {
        // Will be extended onto the file object on a cache hit next time task is ran
        var result = {}; result[module] = hintedfile[module];
        return result;
      }
    });
  }

  azk_gulp.new_task('jshint', function() {
    return azk_gulp.gulp.src(paths, src_opts)
      .pipe(azk_gulp.watching ? azk_gulp.plumber() : azk_gulp.gutil.noop())
      .pipe(_makeLintCache('jshint', jshintrc))
      .pipe(azk_gulp.jshint.reporter(require('jshint-stylish'), { verbose: true}))
      .pipe(azk_gulp.jshint.reporter('fail'));
  });

  azk_gulp.new_task('jscs', function() {
    return azk_gulp.gulp.src(paths, src_opts)
      .pipe(azk_gulp.watching ? azk_gulp.plumber() : azk_gulp.gutil.noop())
      .pipe(_makeLintCache('jscs', jscsrc))
      .pipe(require('gulp-jscs-stylish').combineWithHintResults())
      .pipe(azk_gulp.jshint.reporter(require('jshint-stylish'), { verbose: true}))
      .pipe(azk_gulp.jshint.reporter('fail'));
  });

  azk_gulp.new_task('lint', ['jscs', 'jshint']);
};
