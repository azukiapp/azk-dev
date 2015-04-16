var path   = require('path');
var fs     = require('fs');
var dotenv = require('dotenv');
var spawn  = require('child_process').spawn;

var dynamics = {
  gutil     : 'gulp-util',
  mocha     : 'gulp-mocha',
  babel     : 'gulp-babel',
  sourcemaps: 'gulp-sourcemaps',
  symlink   : 'gulp-symlink',
  help      : 'gulp-help',
  plumber   : 'gulp-plumber',
  debug     : 'gulp-debug',
  jscs      : 'gulp-jscs',
  jshint    : 'gulp-jshint',
  shell     : 'gulp-shell',
  ignore    : 'gulp-ignore',
  changed   : 'gulp-changed',
  clean     : 'gulp-clean',
  cache     : 'gulp-cache',
  rimraf    : 'rimraf',
  sequence  : 'run-sequence',
  chalk     : 'chalk',
  tildify   : 'tildify',
};

var helps = {
  "babel"                : "transpile source and spec (es6 to es5).",
  "babel:runtime:version": "shows the version of babel-runtime to be installed",
  "babel:runtime:install": "install babel-runtime and save it in package.json",
  "babel:spec"           : "transpile spec (es6 to es5).",
  "babel:src"            : "transpile source (es6 to es5).",
  "babel:clean"          : "clean all transpiled files",
  "babel:clean:spec"     : "clean spec transpiled files",
  "bebal:clean:src"      : "clean source transpiled files",
  "editor:config"        : "copy dotfiles (config and lint) to current project",
  "editor:copy:config"   : "copy .editorconfig file to current project",
  "editor:copy:lint"     : "copy .jshintrc and .jscsrc files to current project",
  "jscs"                 : "run jscs hover the source and spec files",
  "jshint"               : "run jshint hover the source and spec files",
  "lint"                 : "run jshint and jscs hover the source and spec files",
  "screen:clean"         : "clean screen (scroll bottom to the top)",
  "test"                 : "run all tests",
  "watch"                : "wait for changes source and spec before run babel",
  "watch:lint"           : "wait for changes source and spec before run lint",
  "watch:lint:test"      : "wait for changes source and spec before run lint and tests",
  "watch:spec"           : "wait for changes spec before run babel",
  "watch:src"            : "wait for changes source before run babel",
  "watch:test"           : "wait for changes source and spec before run tests",
  "watch:test:lint"      : "wait for changes source and spec before run tests and lint",
};

var dotfiles = {
  jshintrc : path.resolve(__dirname, 'shared', '.jshintrc'),
  jscsrc   : path.resolve(__dirname, 'shared', '.jscsrc'),
};

function AzkGulp(config) {
  if (!(this instanceof arguments.callee)) {
    return new arguments.callee(config);
  }

  // Run a watch task
  this.watching = false;

  // Set default
  config.mocha   = config.mocha   || { };
  config.src     = config.src     || { src: "src" , dest: "./lib/src"  };
  config.spec    = config.spec    || { src: "spec", dest: "./lib/spec" };
  config.lint    = config.lint    || [];
  config.clean   = config.clean   || true;
  config.default = config.default || [ "lint", "test" ];
  config.babel   = config.babel   || { optional: ['runtime'] };
  this.config    = config;

  this.set_getters();

  var self = this;
  self.new_task('screen:clean', function() {
    if (self.yargs.argv.clean) {
      process.stdout.write('\u001B[2J\u001B[0;0f');
    }
  });

  this.init_lints();
  this.init_builds();
  this.init_watchs();
  this.init_editor();
  this.init_mocha();

  // default task
  var default_help = 'Run "' + config.default.join(",") + '" tasks';
  self.new_task("default", default_help, config.default);

  // Load envs
  var env_file = path.join(config.cwd, ".env");
  dotenv.load( { path: env_file, silent: true });
}

AzkGulp.prototype = {
  set_getters: function() {
    var self = this;

    self.__defineGetter__('gulp', function() {
      if (!self.__gulp) {
        var help_opts = {
          description: 'you are looking at it.',
          aliases: ['h', '?'],
        };
        self.__gulp = self.help(require('gulp'), help_opts);
      }
      return self.__gulp;
    });

    self.__defineGetter__('yargs', function() {
      if (!self.__yargs) {
        self.__yargs = require('yargs')
          .default('clean'  , self.config.clean)
          .default('force'  , false)
          .default('timeout', self.config.mocha.timeout || 4000)
          .default('invert' , self.config.mocha.invert  || false)
          .default('grep'   , self.config.mocha.grep    || null)
          .default('slow'   , false);
      }
      return self.__yargs;
    });

    self.__defineGetter__('sourcemaps_path', function() {
      var value = self.__sourcemaps_path || self.config.sourcemaps_path;
      if (!value) {
        value = "/" + path.basename(self.config.cwd);
        var file = path.join(self.config.cwd, 'package.json');
        try {
          value += ":" + require(file).version;
          self.__sourcemaps_path = value;
        } catch (e) {}
      }

      return value;
    });

    Object.keys(dynamics).forEach(function(property) {
      self.__defineGetter__(property, function() {
        return require(dynamics[property]);
      });
    });
  },

  init_editor: function() {
    var self = this, tasks = [];

    var add_files = function(name, files) {
      var srcs = [];
      for (var i = 0; i < files.length; i++) {
        srcs[i]  = path.resolve(__dirname, "shared", files[i]);
        files[i] = path.join('./', files[i]);
      }

      var force = self.yargs.argv.force;
      var cond  = function(file) {
        var dest   = path.join(self.config.cwd, path.basename(file.path));
        var full   = self.tildify(path.relative(process.cwd(), file.path));
        var exists = fs.existsSync(dest);
        if (force || !exists) {
          if (exists) {
            self.gutil.log("replacing: " + self.chalk.blue(full));
          } else {
            self.gutil.log("copying: " + self.chalk.green(full));
          }
          return true;
        }
        self.gutil.log("skiping: " + self.chalk.red(full));
        return false;
      }

      tasks.push(name);
      self.new_task(name, function() {
        self.gulp.src(srcs)
          .pipe(self.ignore.include(cond))
          .pipe(self.gulp.dest(self.config.cwd));
      });
    };

    add_files('editor:copy:lint', ['.jscsrc', '.jshintrc']);
    add_files('editor:copy:config', ['.editorconfig']);

    self.new_task('editor:config', tasks);
  },

  init_builds: function() {
    // Set a task related a babel build
    var self = this;
    var babel_tasks = [], clean_tasks = [];

    var add_build = function(name, build_dir) {
      var src_opts = { cwd: self.config.cwd };

      // clean all files
      var clean_task = 'babel:clean:' + name;
      clean_tasks.push(clean_task);
      self.new_task(clean_task, function(cb) {
        var dir = path.join(self.config.cwd, build_dir.dest);
        self.rimraf(dir, cb);
      });

      // clean
      var babel_clean_task = 'babel:fast_clean:' + name;
      self.new_task(babel_clean_task, false, function(cb) {
        var stats = {
          gulpfile: self._statsByFile('gulpfile.js'),
          package : self._statsByFile('package.json'),
        }

        return self.gulp.src(build_dir.dest + '/**/*.js', { cwd: self.config.cwd, read: false})
          .pipe(self.watching ? self.plumber() : self.gutil.noop())
          // Not remove if origin still exist
          .pipe(self.ignore.exclude(function(file) {
            var who    = path.relative(build_dir.dest, file.path);
            var origin = path.join(self.config.cwd, build_dir.src, who);
            return (
              fs.existsSync(origin)
              && (stats.gulpfile === null || stats.gulpfile.mtime < file.stat.mtime)
              && (stats.package  === null || stats.package.mtime  < file.stat.mtime)
            );
          }))
          .pipe(self.debug({ title: "babel:" + name + " - remove:"}))
          .pipe(self.clean({ force: true }));
      });

      // babel
      var babel_task = 'babel:' + name;
      babel_tasks.push(babel_task);
      self.new_task(babel_task, [babel_clean_task], function () {
        return self.gulp.src(build_dir.src + '/**/*.js', src_opts)
          .pipe(self.changed(build_dir.dest, src_opts))
          .pipe(self.watching ? self.plumber() : self.gutil.noop())
          .pipe(self.debug({ title: "babel:" + name + " - transpiled:" }))
          .pipe(self.sourcemaps.init())
          .pipe(self.babel(self.config.babel))
          .pipe(self.sourcemaps.write({ sourceRoot: path.join(self.sourcemaps_path, name) }))
          .pipe(self.gulp.dest(build_dir.dest, src_opts));
      });
    };

    add_build("src" , self.config.src);
    add_build("spec", self.config.spec);

    // Alias babel task to all babel tasks
    self.new_task('babel', babel_tasks);
    self.new_task('babel:clean', clean_tasks);

    // Help to install babel
    var version = function() {
      var babel = require('babel-core');
      return babel.version;
    }
    self.new_task('babel:runtime:version', function() {
      self.gutil.log('babel version: ' + version());
    });

    self.new_task('babel:runtime:install', function() {
      var command = "npm install babel-runtime@" + version() + " --save";
      var stream  = self.shell(command);

      self.gutil.log("running: " + self.chalk.green(command));
      stream.write(new self.gutil.File());
      stream.end();

      return stream;
    });
  },

  init_lints: function() {
    var self = this;
    var src_opts = { cwd: self.config.cwd };

    var paths = self.config.lint;
    paths.push(self.config.src.src  + '/**/*.js');
    paths.push(self.config.spec.src + '/**/*.js');

    // Default or project .jshintrc
    var jshintrc = path.join(self.config.cwd + '.jshintrc');
    if (!fs.existsSync(jshintrc)) { jshintrc = dotfiles.jshintrc; }

    // Default or project .jscsrc
    var jscsrc = path.join(self.config.cwd + '.jscsrc');
    if (!fs.existsSync(jscsrc)) { jscsrc = dotfiles.jscsrc; }

    var _makeLintCache = function(module, lintfile) {
      // var self    = this;
      var version   = require('gulp-' + module + '/package.json').version;
      var lint_opts = fs.readFileSync(lintfile);

      return self.cache(self[module](lintfile), {
        // cache: self.cache.Cache({ cacheDirName: 'jshint' }),
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

    self.new_task('jshint', function() {
      return self.gulp.src(paths, src_opts)
        .pipe(self.watching ? self.plumber() : self.gutil.noop())
        .pipe(_makeLintCache('jshint', jshintrc))
        .pipe(self.jshint.reporter(require('jshint-stylish'), { verbose: true}))
        .pipe(self.jshint.reporter('fail'));
    });

    self.new_task('jscs', function() {
      return self.gulp.src(paths, src_opts)
        .pipe(self.watching ? self.plumber() : self.gutil.noop())
        .pipe(_makeLintCache('jscs', jscsrc))
        .pipe(require('gulp-jscs-stylish').combineWithHintResults())
        .pipe(self.jshint.reporter(require('jshint-stylish'), { verbose: true}))
        .pipe(self.jshint.reporter('fail'));
    });

    self.new_task('lint', ['jscs', 'jshint']);
  },

  init_watchs: function() {
    var self = this;
    var src_opts  = { cwd: self.config.cwd };
    var watch_all = {
      tasks: [],
      srcs : []
    }

    var add_watch = function(name, build_dir) {
      var task = 'babel:' + name;
      var src  = build_dir.src + '/**/*.js';
      watch_all.tasks.push(task);
      watch_all.srcs.push(src);
      self.new_watch('watch:' + name, src, src_opts, ['screen:clean', task]);
    };

    add_watch("src" , self.config.src);
    add_watch("spec", self.config.spec);

    // Watch all
    self.new_watch('watch', watch_all.srcs, src_opts, ['screen:clean', watch_all.tasks]);
    self.new_watch('watch:lint', watch_all.srcs, src_opts, ['screen:clean', 'lint', watch_all.tasks]);
  },

  init_mocha: function() {
    var self = this;
    var src_opts = { read: false, cwd: self.config.cwd };
    var src = self.config.spec.dest + '/**/*_spec.js';
    self.new_task('test', ['babel'], function() {
      process.env.NODE_ENV = process.env.NODE_ENV || "test";
      var mocha_opts = {
        reporter: 'spec',
        // growl: 'true',
        invert : self.yargs.argv.slow ? false : self.yargs.argv.invert,
        grep   : self.yargs.argv.slow ? null  : self.yargs.argv.grep,
        timeout: self.yargs.argv.slow ? self.config.mocha.slow_timeout || 50000 : self.yargs.argv.timeout,
      };

      self.gutil.log("Running mocha with:", mocha_opts);

      self.gulp.src(src, src_opts)
        .pipe(self.watching ? self.plumber() : self.gutil.noop())
        .pipe(self.mocha(mocha_opts));
    });

    var watch_tasks = {
      'watch:test'     : ['screen:clean', 'test'],
      'watch:test:lint': ['screen:clean', 'test', 'lint'],
      'watch:lint:test': ['screen:clean', 'lint', 'test'],
    };

    Object.keys(watch_tasks).forEach(function(task) {
      var src = [
        self.config.src.src  + '/**/*.js',
        self.config.spec.src + '/**/*.js',
      ];
      self.new_watch(task, src, { cwd: self.config.cwd }, watch_tasks[task]);
    });
  },

  new_task: function() {
    var args = Array.prototype.slice.call(arguments);
    var task = args.shift();
    if (helps[task]) {
      args.unshift(helps[task]);
    }
    args.unshift(task);
    this.gulp.task.apply(this.gulp, args);
  },

  new_watch: function(task, src, src_opts, subtasks) {
    var self = this;
    var sequence_name = task + ':sequence';
    self.new_task(sequence_name, false, function() {
      self.sequence.apply(self, subtasks);
    });

    self.new_task(task, function() {
      if (self.yargs.argv.realwatch) {
        self.watching = true;
        self.sequence(sequence_name, function() {
          self.gulp.watch(src, src_opts, [sequence_name]);
        });
      } else {
        // Store current process if any
        var p;
        var args  = process.argv.slice(0).concat('--realwatch');
        var cmd   = args.shift();
        var files = [
          path.join(self.config.cwd, "gulpfile.js"),
          path.join(self.config.cwd, "package.json")
        ];

        self.gulp.watch(files, spawnChildren);
        // Comment the line below if you start your server by yourslef anywhere else
        spawnChildren();

        function spawnChildren(e) {
          if(p) {
              p.kill();
          }

          p = spawn(cmd, args, {stdio: 'inherit'});
        }
      }
    });
  },

  _statsByFile: function(file) {
    file = path.join(this.config.cwd, file);
    if (fs.existsSync(file)) {
      return fs.statSync(file);
    }
    return null;
  }
};

module.exports = AzkGulp;
