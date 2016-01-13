'use strict';

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
  cache     : 'gulp-cache',
  sequence  : 'run-sequence',
  chalk     : 'chalk',
  tildify   : 'tildify',
  del       : 'del',
  vinyl_paths: 'vinyl-paths',
};

function AzkGulp(config) {
  if (!(this instanceof AzkGulp)) {
    return new AzkGulp(config);
  }

  this._constructor(config);
}

AzkGulp.prototype = {
  _constructor: function(config) {
    // Run a watch task
    this.watching = false;

    // Set default
    config.mocha   = config.mocha   || { };
    config.src     = config.src     || { src: "src" , dest: "./lib/src"  };
    config.spec    = config.spec    || { src: "spec", dest: "./lib/spec" };
    config.lint    = config.lint    || [];
    config.clean   = config.clean   || true;
    config.default = config.default || [ "lint", "test" ];
    config.babel   = config.babel   || {
      presets: ['es2015'],
      plugins: ['add-module-exports'],
    };

    this.config = config;
    this.shared_path = path.resolve(__dirname, '..', '..', 'shared');

    // Dynamics loads and creates
    this.set_getters();

    // Gulp initialized by help
    this.gulp = require('./help')(this);

    // Load modules
    require('./clean')(this);
    require('./lints')(this);
    require('./babel')(this);
    require('./watchs')(this);
    require('./editor')(this);
    require('./mocha')(this);

    // default task
    this.new_task("default", config.default);

    // Load envs
    var env_file = path.join(config.cwd, ".env");
    dotenv.load( { path: env_file, silent: true });
  },

  set_getters: function() {
    this.__defineGetter__('yargs', this.get_yargs);
    this.__defineGetter__('sourcemaps_path', this.get_sourcemaps_path);

    // Set getters for lazy require modules
    var self = this;
    Object.keys(dynamics).forEach(function(property) {
      self.__defineGetter__(property, function() {
        return require(dynamics[property]);
      });
    });
  },

  get_yargs: function() {
    if (!this.__yargs) {
      this.__yargs = require('yargs')
        .default('clean'    , this.config.clean)
        .default('force'    , false)
        .default('timeout'  , this.config.mocha.timeout || 4000)
        .default('invert'   , this.config.mocha.invert  || null)
        .default('grep'     , this.config.mocha.grep    || null)
        .default('skip-slow', false)
        .default('slow'     , false);
    }
    return this.__yargs;
  },

  get_sourcemaps_path: function() {
    var value = this.__sourcemaps_path || this.config.sourcemaps_path;
    if (!value) {
      value = path.basename(this.config.cwd);
      var file = path.join(this.config.cwd, 'package.json');
      try {
        value += "-" + require(file).version + ' - ';
        this.__sourcemaps_path = value;
      } catch (e) {}
    }

    return value;
  },

  new_task: function() {
    var args = Array.prototype.slice.call(arguments);
    var task = args.shift();
    if (this.help_msgs[task]) {
      args.unshift(this.help_msgs[task]);
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

        var spawnChildren = function(e) {
          if(p) { p.kill(); }
          p = spawn(cmd, args, {stdio: 'inherit'});
        };

        self.gulp.watch(files, spawnChildren);
        // Comment the line below if you start your server by yourslef anywhere else
        spawnChildren();
      }
    });
  },
};

module.exports = AzkGulp;
