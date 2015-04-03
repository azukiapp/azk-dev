var path = require('path');

var dynamics = {
  gulp          : 'gulp',
  mocha         : 'gulp-mocha',
  taskListing   : 'gulp-task-listing',
  babel         : 'gulp-babel',
  sourcemaps    : 'gulp-sourcemaps',
  jscs          : 'gulp-jscs',
  jshint        : 'gulp-jshint',
  jshint_stylish: 'jshint-stylish',
  rimraf        : 'rimraf',
  yargs         : 'yargs',
}

var jshintrc = path.resolve(__dirname, '..', 'shared', '.jshintrc');
var jscsrc   = path.resolve(__dirname, '..', 'shared', '.jscsrc');

function swallowError (error) {
  //If you want details of the error in the console
  console.log(error.stack ? error.stack : error.toString());
  this.emit('end');
}

function AzkGulp(config) {
  if(!(this instanceof arguments.callee)) {
    return new arguments.callee(config);
  }

  // Set default
  config.src  = config.src  || "src";
  config.spec = config.spec || "spec";
  config.lint = config.lint || [];
  this.config = config;

  this.set_getters();

  this.init_mocha();
  this.init_lints();
  this.init_builds();
  this.init_watchs();

  // Add a task to render the output
  this.gulp.task('help', this.taskListing);
}

AzkGulp.prototype = {
  set_getters: function() {
    var self = this;
    Object.keys(dynamics).forEach(function(property) {
      self.__defineGetter__(property, function() {
        return require(dynamics[property]);
      });
    });
  },

  init_builds: function() {
    // Set a task related a babel build
    var self = this;
    var babel_tasks = [], clean_tasks = [];

    var add_build = function(name, build_dir) {
      var src_opts = { cwd: self.config.cwd };

      // clean
      var clean_task = 'clean-lib-' + name;
      clean_tasks.push(clean_task);
      self.gulp.task(clean_task, function(cb) {
        var dir = path.join(self.config.cwd, './lib', build_dir);
        self.rimraf(dir, cb);
      });

      // babel
      var babel_task = 'babel-' + name;
      babel_tasks.push(babel_task);
      self.gulp.task(babel_task, [clean_task], function () {
        return self.gulp.src(build_dir + '/**/*.js', src_opts)
          .pipe(self.sourcemaps.init())
          .pipe(self.babel())
          .on('error', swallowError)
          .pipe(self.sourcemaps.write())
          .pipe(self.gulp.dest(path.join('lib', build_dir), src_opts));
      });
    }

    add_build("src" , self.config.src);
    add_build("spec", self.config.spec);

    // Alias babel task to all babel tasks
    self.gulp.task('babel', babel_tasks);
    self.gulp.task('clean-lib', clean_tasks);
  },

  init_lints: function() {
    var self = this;
    var src_opts = { cwd: self.config.cwd };

    var paths = self.config.lint;
    paths.push(self.config.src  + '/**/*.js');
    paths.push(self.config.spec + '/**/*.js');

    self.gulp.task('jshint', function() {
      return self.gulp.src(paths, src_opts)
        .pipe(self.jshint(jshintrc))
        .pipe(self.jshint.reporter(jshint_stylish))
        .pipe(self.jshint.reporter('fail'))
    });

    self.gulp.task('jscs', function() {
      return self.gulp.src(paths, src_opts)
        .pipe(self.jscs(jscsrc));
    });

    self.gulp.task('lint', ['jscs', 'jshint']);
  },

  init_watchs: function() {
    var self = this;
    var src_opts = { cwd: self.config.cwd };
    var tasks = [];

    var add_watch = function(name, build_dir) {
      var task = 'watch-' + name;
      tasks.push(task);
      self.gulp.task(task, function() {
        var src     = build_dir + '/**/*.js'
        var subtask = ['babel-' + name];
        self.gulp.watch(src, src_opts, subtask);
      });
    }

    add_watch("src" , self.config.src);
    add_watch("spec", self.config.spec);

    // alias for all
    self.gulp.task('watch', tasks);
  },

  init_mocha: function() {
    var self = this;
    var src_opts = { read: false, cwd: self.config.cwd };
    var src = 'lib/' + self.config.spec + '/**/*_spec.js';
    console.log(src);
    self.gulp.task('mocha', ['babel'], function() {
      return self.gulp.src(src, src_opts)
        .pipe( self.mocha( {
          reporter: 'spec', growl: 'true', grep: self.yargs.argv.grep, timeout: 4000
        } ));
    });

    self.gulp.task('spec', ['mocha']);

    var watch_tasks = {
      'watch-mocha': ['mocha'],
      'watch-mocha-lint': ['mocha', 'lint'],
      'watch-lint-mocha': ['lint' , 'mocha'],
    };

    Object.keys(watch_tasks).forEach(function(task) {
      var src = [
        self.config.src  + '/**/*.js',
        self.config.spec + '/**/*.js',
      ];
      var subtask = watch_tasks[task];
      self.gulp.task(task, subtask, function() {
        self.gulp.watch(src, { cwd: self.config.cwd }, subtask);
      });
    });
  }
}

module.exports = AzkGulp;
