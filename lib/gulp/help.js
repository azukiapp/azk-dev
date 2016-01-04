'use strict';



module.exports = function(azk_gulp) {
  var help_opts = {
    description: 'you are looking at it.',
    aliases: ['h', '?'],
  };

  var deprec = azk_gulp.chalk.red("(depreciation!) ");

  azk_gulp.help_msgs = {
    "default"               : "Run default tasks:",
    "babel"                 : "transpile source and spec (es6 to es5).",
    "babel:runtime:version" : deprec + "shows the version of babel-runtime to be installed",
    "babel:runtime:install" : deprec + "install babel-runtime and save it in package.json",
    "babel:core:version"    : "shows the version of babel-core",
    "babel:polyfill:install": "install babel-polyfill and save it in package.json",
    "babel:spec"            : "transpile spec (es6 to es5).",
    "babel:src"             : "transpile source (es6 to es5).",
    "babel:clean"           : "clean all transpiled files",
    "babel:clean:spec"      : "clean spec transpiled files",
    "babel:clean:src"       : "clean source transpiled files",
    "editor:config"         : "copy dotfiles (config and lint) to current project",
    "editor:copy:config"    : "copy .editorconfig file to current project",
    "editor:copy:lint"      : "copy .jshintrc and .jscsrc files to current project",
    "jscs"                  : "run jscs hover the source and spec files",
    "jshint"                : "run jshint hover the source and spec files",
    "lint"                  : "run jshint and jscs hover the source and spec files",
    "screen:clean"          : "clean screen (scroll bottom to the top)",
    "test"                  : "run all tests",
    "watch"                 : "wait for changes source and spec before run babel",
    "watch:lint"            : "wait for changes source and spec before run lint",
    "watch:lint:test"       : "wait for changes source and spec before run lint and tests",
    "watch:spec"            : "wait for changes spec before run babel",
    "watch:src"             : "wait for changes source before run babel",
    "watch:test"            : "wait for changes source and spec before run tests",
    "watch:test:lint"       : "wait for changes source and spec before run tests and lint",
  };

  return azk_gulp.help(require('gulp'), help_opts);
}
