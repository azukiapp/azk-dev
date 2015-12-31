# Change Log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## dev

* Enhancements
  * [Generators] Adding support to use generators and promises in tests;
  * [Chai] Adding chai-subset and change load order of the chai plugins;
  * [Babel] Adding `babel:polyfill:install` gulp task, to assist in the installation of the `babel-polyfill` lib;
  * [Babel] Adding `babel:core:version` gulp task, it helps to find out the version of the babel `azk-dev` this using;

* Deprecations
  * [Babel] The "runtime" option is no longer default, and its use generates a depreciation alert. The dependence "babel-polyfill" should be used instead;
  * [Require] The loading of files from the root directory become discouraged, files should be loaded from the lib folder, as the example: `require('azk-dev/chai') => require('azk-dev/lib/chai')`;
