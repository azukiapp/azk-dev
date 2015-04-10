
var azk_gulp = require('../../gulp')({
  cwd  : __dirname,
  default: [ "show:envs" ],
  sourcemaps_path: "/mytest",
  // babel: {},
});

var gulp = azk_gulp.gulp;

gulp.task("show:args", "custom help", function() {
  console.log(azk_gulp.yargs.argv);
  return null;
});

gulp.task("show:envs", function() {
  console.log(process.env);
  return null;
});
