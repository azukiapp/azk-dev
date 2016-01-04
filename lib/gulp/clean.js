
module.exports = function(azk_gulp) {
  azk_gulp.new_task('screen:clean', function() {
    if (azk_gulp.yargs.argv.clean) {
      process.stdout.write('\u001B[2J\u001B[0;0f');
    }
  });
}
