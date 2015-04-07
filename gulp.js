var path   = require('path');
var dotenv = require('dotenv');

var dynamics = {
  // gulp          : 'gulp',
  gutil         : 'gulp-util',
  mocha         : 'gulp-mocha',
  babel         : 'gulp-babel',
  sourcemaps    : 'gulp-sourcemaps',
  symlink       : 'gulp-symlink',
  jscs          : 'gulp-jscs',
  jshint        : 'gulp-jshint',
  jshint_stylish: 'jshint-stylish',
  rimraf        : 'rimraf',
  help          : 'gulp-help',
};

var helps = {
  "babel"             : "transpile source and spec (es6 to es5).",
  "babel:spec"        : "transpile spec (es6 to es5).",
  "babel:src"         : "transpile source (es6 to es5).",
  "clean:lib"         : "clean all transpiled files",
  "clean:lib:spec"    : "clean spec transpiled files",
  "clean:lib:src"     : "clean source transpiled files",
  "editor:config"     : "create symlinks to config and lint dot files",
  "editor:link:config": "create symlinks to .editorconfig file",
  "editor:link:lint"  : "create symlinks to .jshintrc and .jscsrc files",
  "jscs"              : "run jscs hover the source and spec files",
  "jshint"            : "run jshint hover the source and spec files",
  "lint"              : "run jshint and jscs hover the source and spec files",
  "screen:clean"      : "clean screen (scroll bottom to the top)",
  "test"              : "run all test tests",
  "watch"             : "wait for changes source and spec before run babel",
  "watch:lint:test"   : "wait for changes source and spec before run lint and tests",
  "watch:spec"        : "wait for changes spec before run babel",
  "watch:src"         : "wait for changes source before run babel",
  "watch:test"        : "wait for changes source and spec before run tests",
  "watch:test:lint"   : "wait for changes source and spec before run tests and lint",
};

var jshintrc = path.resolve(__dirname, 'shared', '.jshintrc');
var jscsrc   = path.resolve(__dirname, 'shared', '.jscsrc');

function swallowError (error) {
  //If you want details of the error in the console
  console.log(error.stack ? error.stack : error.toString());
  this.emit('end');
}

function AzkGulp(config) {
  if (!(this instanceof arguments.callee)) {
    return new arguments.callee(config);
  }

  // Set default
  config.src   = config.src   || "src";
  config.spec  = config.spec  || "spec";
  config.lint  = config.lint  || [];
  config.clean = config.clean || true;
  this.config  = config;

  this.set_getters();

  this.init_mocha();
  this.init_lints();
  this.init_builds();
  this.init_watchs();
  this.init_editor();

  // Add a task to render the output
  // TODO: Add options to help
  // this.gulp.task('help', this.taskListing);

  var self = this;
  self.new_task('screen:clean', function() {
    if (self.yargs.argv.clean) {
      process.stdout.write('\u001B[2J\u001B[0;0f');
    }
  });

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
          // afterPrintCallback: function(tasks) {
          //   console.log(tasks);
          // }
        };
        self.__gulp = self.help(require('gulp'), help_opts);
      }
      return self.__gulp;
    });

    self.__defineGetter__('yargs', function() {
      if (!self.__yargs) {
        self.__yargs = require('yargs')
          .default('clean', self.config.clean);
      }
      return self.__yargs;
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

      tasks.push(name);
      self.new_task(name, function() {
        self.gulp.src(srcs).pipe(self.symlink(files, { force: true}));
      });
    };

    add_files('editor:link:lint', ['.jscsrc', '.jshintrc']);
    add_files('editor:link:config', ['.editorconfig']);

    self.new_task('editor:config', tasks);
  },

  init_builds: function() {
    // Set a task related a babel build
    var self = this;
    var babel_tasks = [], clean_tasks = [];

    var add_build = function(name, build_dir) {
      var src_opts = { cwd: self.config.cwd };

      // clean
      var clean_task = 'clean:lib:' + name;
      clean_tasks.push(clean_task);
      self.new_task(clean_task, function(cb) {
        var dir = path.join(self.config.cwd, './lib', build_dir);
        self.rimraf(dir, cb);
      });

      // babel
      var babel_task = 'babel:' + name;
      babel_tasks.push(babel_task);
      self.new_task(babel_task, [clean_task], function () {
        return self.gulp.src(build_dir + '/**/*.js', src_opts)
          .pipe(self.sourcemaps.init())
          .pipe(self.babel())
          .on('error', swallowError)
          .pipe(self.sourcemaps.write())
          .pipe(self.gulp.dest(path.join('lib', build_dir), src_opts));
      });
    };

    add_build("src" , self.config.src);
    add_build("spec", self.config.spec);

    // Alias babel task to all babel tasks
    self.new_task('babel', babel_tasks);
    self.new_task('clean:lib', clean_tasks);
  },

  init_lints: function() {
    var self = this;
    var src_opts = { cwd: self.config.cwd };

    var paths = self.config.lint;
    paths.push(self.config.src  + '/**/*.js');
    paths.push(self.config.spec + '/**/*.js');

    self.new_task('jshint', function() {
      return self.gulp.src(paths, src_opts)
        .pipe(self.jshint(jshintrc))
        .pipe(self.jshint.reporter(self.jshint_stylish))
        .pipe(self.jshint.reporter('fail'));
    });

    self.new_task('jscs', function() {
      return self.gulp.src(paths, src_opts)
        .pipe(self.jscs(jscsrc));
    });

    self.new_task('lint', ['jscs', 'jshint']);
  },

  init_watchs: function() {
    var self = this;
    var src_opts = { cwd: self.config.cwd };
    var tasks = ['screen:clean'];

    var add_watch = function(name, build_dir) {
      var subtask = ['screen:clean', 'babel:' + name];
      var task    = 'watch:' + name;
      tasks.push(task);
      self.new_task(task, subtask, function() {
        var src     = build_dir + '/**/*.js';
        self.gulp.watch(src, src_opts, subtask);
      });
    };

    add_watch("src" , self.config.src);
    add_watch("spec", self.config.spec);

    // alias for all
    self.new_task('watch', tasks);
  },

  init_mocha: function() {
    var self = this;
    var src_opts = { read: false, cwd: self.config.cwd };
    var src = 'lib/' + self.config.spec + '/**/*_spec.js';
    self.new_task('test', ['babel'], function() {
      process.env.NODE_ENV = process.env.NODE_ENV || "test";
      return self.gulp.src(src, src_opts)
        .pipe(self.mocha({
          reporter: 'spec',
          growl: 'true',
          grep: self.yargs.argv.grep,
          timeout: 4000
        }));
    });

    var watch_tasks = {
      'watch:test'     : ['screen:clean', 'test'],
      'watch:test:lint': ['screen:clean', 'test', 'lint'],
      'watch:lint:test': ['screen:clean', 'lint', 'test'],
    };

    Object.keys(watch_tasks).forEach(function(task) {
      var src = [
        self.config.src  + '/**/*.js',
        self.config.spec + '/**/*.js',
      ];
      var subtask = watch_tasks[task];
      self.new_task(task, subtask, function() {
        self.gulp.watch(src, { cwd: self.config.cwd }, subtask);
      });
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
  }
};

module.exports = AzkGulp;
