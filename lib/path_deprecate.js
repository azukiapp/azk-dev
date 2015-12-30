
var path = require('path');
var warning = require('./warning');

module.exports = function(file) {
  var basename = path.basename(file, '.js');
  warning(
    'DEPRECATE ALERT!!',
    "Use: `azk-dev/lib/" + basename + "` in replace of `azk-dev/" + basename + "`."
  );
  return require('./' + basename);
}
