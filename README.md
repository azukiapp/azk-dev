# azk-dev

## Gulp Tasks (commons azk project tasks)

How to import commons azk-dev gulp tasks and extends:

```js
// gulpfile.js
var azk_gulp = require('azk-dev/gulp')({
  cwd  : __dirname,
  sourcemaps_path: "/mytest", // Custom path to prefix transpiled files
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

##### Available configs:

- **src:**     default: { src: "src"  , dest: "./lib/src" };
- **spec:**    default: { src: "spec" , dest: "./lib/spec" };
- **lint:**    default: [];
- **clean:**   default: true;
- **default:** default: [ "lint", "test" ];
- **babel:**   default: { optional: ['runtime'] };
- **sourcemaps_path** default: path.basename(process.cwd);

## Babel

To use babel in your project require to install `babel-runtime`:

```shell
$ gulp babel:runtime:install
```

Or

```shell
$ gulp babel:runtime:version
$ npm install babel-runtime@[version] --save
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

Copy dotfiles `.jscsrc`, `.jshintrc` and `.editorconfig` from `shared` folder to current project. Use `--force` to overwrite.

```shell
$  gulp editor:config
```

## Deploy npm package

Adding this in package.json:

```js
"deploy" : "./node_modules/.bin/npm-deploy"
```

Now you can deploy package with:

```shell
$ npm run deploy [<newversion> | major | minor | patch | premajor | preminor | prepatch | prerelease]
```

This should run the following steps:

  - Check if not tracked commits in git
  - Run tests with `npm test`
  - Upgrade version in `package.json`, commit and add tag
  - Publish package in npmjs.com

## TODO

- Notify: https://github.com/mikaelbr/gulp-notify

## License

"Azuki", "Azk" and the Azuki logo are copyright (c) 2013-2015 Azuki Serviços de Internet LTDA.

Azk-dev source code is released under Apache 2 License.

Check LEGAL and LICENSE files for more information.
