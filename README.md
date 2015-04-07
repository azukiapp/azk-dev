# azk-dev

## Gulp Tasks (commons azk project tasks)

Howto import commons azk-dev gulp tasks and extends:

```js
// gulpfile.js
var azk_gulp = require('azk-dev/gulp')({
  cwd  : __dirname,
  lint: [ "bin/**/*.js" ], // Extra files for the lint analyzer
});

var gulp = azk_gulp.gulp;

gulp.task("show:args", "Help text", ["before:show"], function() {
  console.log(azk_gulp.yargs.argv);
  return null;
}, { aliases: ["sa", "s"] });
```

Check the tasks added to the running gulp (yes we have a `gulp help` \o/):

```shel
$ gulp help
```

## Chai

```js
// spec/spec-help.js
var Helpers = {
  expect : require('azk-dev/chai').expect,
};

export default Helpers;
```

## Editor Configs

Create symlinks to `shared/.jscsrc`, `shared/.jshintrc` and `shared/.editorconfig`

```shell
$  gulp editor-config
```

## License

"Azuki", "Azk" and the Azuki logo are copyright (c) 2013-2015 Azuki Serviços de Internet LTDA.

Azk source code is released under Apache 2 License.

Check LEGAL and LICENSE files for more information.
