
module.exports = function(azk_gulp) {
  var src_opts  = { cwd: azk_gulp.config.cwd };
  var watch_all = {
    tasks: [],
    srcs : []
  }

  var add_watch = function(name, build_dir) {
    var task = 'babel:' + name;
    var src  = build_dir.src + '/**/*.js';
    watch_all.tasks.push(task);
    watch_all.srcs.push(src);
    azk_gulp.new_watch('watch:' + name, src, src_opts, ['screen:clean', task]);
  };

  add_watch("src" , azk_gulp.config.src);
  add_watch("spec", azk_gulp.config.spec);

  // Watch all
  azk_gulp.new_watch('watch', watch_all.srcs, src_opts, ['screen:clean', watch_all.tasks]);
  azk_gulp.new_watch('watch:lint', watch_all.srcs, src_opts, ['screen:clean', 'lint', watch_all.tasks]);
};
