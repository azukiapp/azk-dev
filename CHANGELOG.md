# Change Log

All notable changes to this project will be documented in this file.
This project adheres to [Semantic Versioning](http://semver.org/).

## dev

* Enhancements
  * [Generators] Adding support to use generators and promises in tests;
  * [Chai] Adding chai-subset and change load order of the chai plugins;

* Deprecations
  * [Require] The loading of files from the root directory become discouraged, files should be loaded from the lib folder, as the example: `require('azk-dev/chai') => require('azk-dev/lib/chai')`;
