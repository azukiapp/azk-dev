
var path = require('path');

function isGeneratorFunction(fn) {
  return typeof fn === 'function' &&
    fn.constructor &&
    fn.constructor.name === 'GeneratorFunction';
}

module.exports = function(fn_support) {
  var suffix    = path.sep + path.join('', 'mocha', 'index.js');
  var children  = require.cache || {};

  var modules = Object.keys(children).filter(function (child) {
    return child.slice(suffix.length * -1) === suffix;
  }).map(function (child) {
    return children[child].exports;
  });

  modules.forEach(function(mocha) {
    var Runnable = mocha.Runnable;

    if (Runnable.__generatorsIsLoaded) {
      return true;
    }

    var run = Runnable.prototype.run;
    Runnable.prototype.run = function (fn) {
      if (isGeneratorFunction(this.fn)) {
        var _fn = this.fn;
        this.fn = function() {
          return fn_support(_fn);
        };
      }
      return run.call(this, fn);
    };

    Runnable.__generatorsIsLoaded = true;
  });
};
