var h       = require('./spec-helper');
var shell   = require('shelljs');
var path    = require('path');
var gulp    = require('gulp');
var Promise = require('bluebird');
var pfs     = Promise.promisifyAll(require('fs'));

describe("azk-dev gulp", function() {
  var fixture = path.join(__dirname, 'fixtures');
  var result  = { code: null, out: null };

  var runGulp = function(cmd, cb) {
    shell.cd(fixture);
    shell.exec(cmd, { silent: true }, function(code, out) {
      result.code = code;
      result.out  = out;
      cb(null, result);
    });
  };

  var dot_files = [
    '.editorconfig', '.jscsrc', '.jshintrc'
  ];
  var removeEditorConfigs = function() {
    // Clear dot files
    var file, promises = [];
    for(var i = 0; i < dot_files.length; i++) {
      file = path.join(fixture, dot_files[i]);
      promises.push(pfs.unlinkAsync(file).catch(function() {}));
    }
    return Promise.all(promises);
  }

  // Protect change path
  var cwd = process.cwd();
  before(removeEditorConfigs);
  after(function() {
    shell.cd(cwd);
    return removeEditorConfigs();
  });

  it("should suporte run custom task with args", function(cb) {
    runGulp("gulp show:args --custom 'my mensagem'", function() {
      h.expect(result.out).to.match(/custom: 'my mensagem'/);
      h.expect(result.out).to.match(/Finished 'show:args'/);
      h.expect(result.code).to.equal(0);
      cb();
    });
  });

  it("should create a links", function() {
    var check_files = function() {
      var file, promises = [];
      for(var i = 0; i < dot_files.length; i++) {
        file = path.join(fixture, dot_files[i]);
        promises.push(pfs.lstatAsync(file).catch(function() {}));
      }
      return Promise.all(promises);
    }

    return check_files()
    .then(function(result) {
      h.expect(result).to.eql([undefined, undefined, undefined]);
      return Promise.fromNode(runGulp.bind(this, "gulp editor:config"));
    })
    .then(function() {
      return check_files();
    })
    .then(function(result) {
      for(var i = 0; i < result.length; i++) {
        h.expect(result[i].isFile()).to.ok;
      }
    });
  });

  it("should load envs variables from .env", function() {
    return Promise.fromNode(runGulp.bind(this, "bash -c 'TEST_VAR_FROM_ENV=foobar gulp show:envs'"))
      .then(function(result) {
        h.expect(result.code).to.equal(0);
        h.expect(result.out).to.match(/^\s*TEST_VAR_FROM_FILE: 'thefile'/m);
        h.expect(result.out).to.match(/\s*TEST_VAR_FROM_ENV: 'foobar'/m);
      });
  });

  describe("call test", function() {
    this.timeout(50000);

    it("should run all test and not skiped slow by default", function(cb) {
      runGulp("gulp test", function() {
        h.expect(result.out).to.match(/\s* ✓ should divide\s*.*$/m);
        h.expect(result.out).to.match(/\s* ✓ should create a instance\s*.*$/m);
        h.expect(result.out).to.match(/\s* ✓ should skip @slow test\s*.*$/m);
        h.expect(result.out).to.not.match(/\s* \d* failing\s*.*$/m);
        h.expect(result.code).to.equal(0);
        cb();
      });
    });

    it("should run all tests and skip @slow if required", function(cb) {
      runGulp("gulp test --skip-slow", function() {
        h.expect(result.out).to.match(/\s* ✓ should divide\s*.*$/m);
        h.expect(result.out).to.match(/\s* ✓ should create a instance\s*.*$/m);
        h.expect(result.out).to.not.match(/\s* ✓ should skip @slow test\s*.*$/m);
        h.expect(result.out).to.not.match(/\s* \d* failing\s*.*$/m);
        h.expect(result.code).to.equal(0);
        cb();
      });
    });

    it("should run only spes match if grep option", function(cb) {
      runGulp("gulp test --grep='should divide'", function() {
        h.expect(result.out).to.match(/\s* ✓ should divide\s*.*$/m);
        h.expect(result.out).to.not.match(/\s* ✓ should create a instance\s*.*$/m);
        h.expect(result.out).to.not.match(/\s* ✓ should skip @slow test\s*.*$/m);
        h.expect(result.out).to.not.match(/\s* \d* failing\s*.*$/m);
        h.expect(result.code).to.equal(0);
        cb();
      });
    })

    it("should fail process if spec not pass", function(cb) {
      runGulp("gulp test --forcefail", function() {
        h.expect(result.code).to.equal(7);
        cb();
      });
    })
  });

  describe("call help", function() {
    before(function(cb) {
      runGulp("gulp help", cb);
    });

    it("should show main and sub tasks", function() {
      h.expect(result.code).to.equal(0);
      h.expect(result.out).to.match(/^Usage$/m);
      h.expect(result.out).to.match(/^Available tasks$/m);
    });

    it("should have a full help and custom help", function() {
      h.expect(result.out).to.match(/^\s*default\s*Run default tasks: \[show:envs\]$/m);
      h.expect(result.out).to.match(/^\s*show:args\s*custom help$/m);
      h.expect(result.out).to.match(/^\s*test\s*run all tests \[babel\]$/m);
    });

    it("should have a babel tasks", function() {
      h.expect(result.out).to.match(/^\s*babel\s*.*$/m);
      h.expect(result.out).to.match(/^\s*babel:spec\s*.*$/m);
      h.expect(result.out).to.match(/^\s*babel:src\s*.*$/m);
      h.expect(result.out).to.match(/^\s*babel:clean\s*.*$/m);
      h.expect(result.out).to.match(/^\s*babel:clean:src\s*.*$/m);
      h.expect(result.out).to.match(/^\s*babel:clean:spec\s*.*$/m);
    });

    it("should have a watch tasks to babel transpiler", function() {
      h.expect(result.out).to.match(/^\s*watch:src\s*.*$/m);
      h.expect(result.out).to.match(/^\s*watch:spec\s*.*$/m);
    });

    it("should have a watch tasks", function() {
      h.expect(result.out).to.match(/^\s*watch\s*.*$/m);
      h.expect(result.out).to.match(/^\s*watch:test\s*.*$/m);
      h.expect(result.out).to.match(/^\s*watch:test:lint\s*.*$/m);
      h.expect(result.out).to.match(/^\s*watch:lint:test\s*.*$/m);
    });

    it("should support extra task", function() {
      h.expect(result.out).to.match(/^\s*show:args\s*.*$/m);
    })
  });

});
