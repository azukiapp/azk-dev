var chalk = require('chalk');

module.exports = function(label, msg, level) {
  if (typeof(level) == 'undefined') {
    level = 'error';
  }

  var fm = '' +
    chalk.red('\n========== (azk-dev) =================\n') +
    chalk.yellow('%s') + ' %s' +
    chalk.red('\n========== (azk-dev) =================\n');

  console[level](fm, label, msg);
}
