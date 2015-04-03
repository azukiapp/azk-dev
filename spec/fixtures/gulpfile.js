
var azk_gulp = require('../../gulp')({
  cwd  : __dirname,
});

var gulp = azk_gulp.gulp;

gulp.task("custom", function() {
  console.log(azk_gulp.yargs.argv.custom);
  return null;
});
