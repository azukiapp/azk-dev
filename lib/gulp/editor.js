var path = require('path');
var fs   = require('fs');

module.exports = function(azk_gulp) {
  var tasks = [];

  var add_files = function(name, files) {
    var srcs = [];
    for (var i = 0; i < files.length; i++) {
      srcs[i]  = path.join(azk_gulp.shared_path, files[i]);
      files[i] = path.join('./', files[i]);
    }

    var force = azk_gulp.yargs.argv.force;
    var cond  = function(file) {
      var dest   = path.join(azk_gulp.config.cwd, path.basename(file.path));
      var full   = azk_gulp.tildify(path.relative(process.cwd(), file.path));
      var exists = fs.existsSync(dest);
      if (force || !exists) {
        if (exists) {
          azk_gulp.gutil.log("replacing: " + azk_gulp.chalk.blue(full));
        } else {
          azk_gulp.gutil.log("copying: " + azk_gulp.chalk.green(full));
        }
        return true;
      }
      azk_gulp.gutil.log("skiping: " + azk_gulp.chalk.red(full));
      return false;
    }

    tasks.push(name);
    azk_gulp.new_task(name, function() {
      azk_gulp.gulp.src(srcs)
        .pipe(azk_gulp.ignore.include(cond))
        .pipe(azk_gulp.gulp.dest(azk_gulp.config.cwd));
    });
  };

  add_files('editor:copy:lint', ['.jscsrc', '.jshintrc']);
  add_files('editor:copy:config', ['.editorconfig']);

  azk_gulp.new_task('editor:config', tasks);
};
