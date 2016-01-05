var path = require('path');
var fs   = require('fs');

function statsByFile(cwd, file) {
  file = path.join(cwd, file);
  if (fs.existsSync(file)) {
    return fs.statSync(file);
  }
  return null;
};

module.exports = function(azk_gulp) {
  // Set a task related a babel build
  var babel_tasks = [], clean_tasks = [];

  var add_build = function(name, build_dir) {
    var src_opts = { cwd: azk_gulp.config.cwd };

    // clean all files
    var clean_task = 'babel:clean:' + name;
    clean_tasks.push(clean_task);
    azk_gulp.new_task(clean_task, function() {
      var dir = path.join(azk_gulp.config.cwd, build_dir.dest);
      return azk_gulp.gulp.src(dir).pipe(azk_gulp.vinyl_paths(azk_gulp.del));
    });

    // clean
    var babel_clean_task = 'babel:fast_clean:' + name;
    azk_gulp.new_task(babel_clean_task, false, function(cb) {
      var stats = {
        gulpfile: statsByFile(azk_gulp.config.cwd, 'gulpfile.js'),
        package : statsByFile(azk_gulp.config.cwd, 'package.json'),
      }

      return azk_gulp.gulp.src(build_dir.dest + '/**/*.js', { cwd: azk_gulp.config.cwd, read: false})
        .pipe(azk_gulp.watching ? azk_gulp.plumber() : azk_gulp.gutil.noop())
        // Not remove if origin still exist
        .pipe(azk_gulp.ignore.exclude(function(file) {
          var who    = path.relative(build_dir.dest, file.path);
          var origin = path.join(azk_gulp.config.cwd, build_dir.src, who);
          return (
            fs.existsSync(origin)
            && (stats.gulpfile === null || stats.gulpfile.mtime < file.stat.mtime)
            && (stats.package  === null || stats.package.mtime  < file.stat.mtime)
          );
        }))
        .pipe(azk_gulp.debug({ title: "babel:" + name + " - remove:"}))
        .pipe(azk_gulp.vinyl_paths(azk_gulp.del));
    });

    // babel
    var babel_task = 'babel:' + name;
    babel_tasks.push(babel_task);
    azk_gulp.new_task(babel_task, [babel_clean_task], function () {
      // Require local (azk-dev) presents and plugins
      var presents = azk_gulp.config.babel.presets || [];
      azk_gulp.config.babel.presets = presents.map(function(preset) {
        if (typeof(preset) === "string") {
          try {
            preset = require('babel-preset-' + preset);
          } catch (err) { }
        }
        return preset;
      });

      var plugins = azk_gulp.config.babel.plugins || [];
      azk_gulp.config.babel.plugins = plugins.map(function(plugin) {
        if (typeof(plugin) === "string") {
          try {
            plugin = require('babel-plugin-' + plugin);
          } catch (err) { }
        }
        return plugin;
      });

      return azk_gulp.gulp.src(build_dir.src + '/**/*.js', src_opts)
        .pipe(azk_gulp.changed(build_dir.dest, src_opts))
        .pipe(azk_gulp.watching ? azk_gulp.plumber() : azk_gulp.gutil.noop())
        .pipe(azk_gulp.debug({ title: "babel:" + name + " - transpiled:" }))
        .pipe(azk_gulp.sourcemaps.init())
        .pipe(azk_gulp.babel(azk_gulp.config.babel))
        .pipe(azk_gulp.sourcemaps.write({ sourceRoot: azk_gulp.sourcemaps_path + name }))
        .pipe(azk_gulp.gulp.dest(build_dir.dest, src_opts));
    });
  };

  add_build("src" , azk_gulp.config.src);
  add_build("spec", azk_gulp.config.spec);

  // Alias babel task to all babel tasks
  azk_gulp.new_task('babel', babel_tasks);
  azk_gulp.new_task('babel:clean', clean_tasks);

  // Help to install babel
  var version = function() {
    var babel = require('babel-core');
    return babel.version;
  }

  azk_gulp.new_task('babel:core:version', function() {
    azk_gulp.gutil.log('babel-core version: ' + version());
  });

  // Adding deprecate option
  babel_runtime(azk_gulp, version);

  // babel polyfill
  azk_gulp.new_task('babel:polyfill:install', function() {
    var command = "npm install babel-polyfill --save";
    var stream  = azk_gulp.shell(command);

    azk_gulp.gutil.log("running: " + azk_gulp.chalk.green(command));
    stream.write(new azk_gulp.gutil.File());
    stream.end();

    return stream;
  });
};

function babel_runtime(azk_gulp, version_fn) {
  var optional = azk_gulp.config.babel.optional;

  if (optional instanceof Array) {
    // Search runtime option
    var runtime = false;
    for(var i = 0; i < optional.length; i++) {
      runtime = runtime || optional[i] == 'runtime';
    }

    if (runtime) {
      var warning = require('../warning');
      warning(
        'DEPRECATE ALERT!!',
        'babel-runtime this deprecation, use `babel-polyfill` instead'
      );

      azk_gulp.new_task('babel:runtime:version', function() {
        azk_gulp.gutil.log('babel version: ' + version_fn());
      });

      azk_gulp.new_task('babel:runtime:install', function() {
        var command = "npm install babel-runtime@" + version_fn() + " --save";
        var stream  = azk_gulp.shell(command);

        azk_gulp.gutil.log("running: " + azk_gulp.chalk.green(command));
        stream.write(new azk_gulp.gutil.File());
        stream.end();

        return stream;
      });
    }
  }
};
