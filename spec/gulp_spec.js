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
      // console.log(out);
      cb();
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
    runGulp("gulp custom --custom 'my mensagem'", function() {
      h.expect(result.out).to.match(/my mensagem/);
      h.expect(result.out).to.match(/Finished 'custom'/);
      h.expect(result.code).to.equal(0);
      cb();
    });
  });

  it("should support run mocha", function(cb) {
    runGulp("gulp mocha", function() {
      h.expect(result.out).to.match(/\s* ✓ should divide\s*$/m);
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
      return Promise.fromNode(runGulp.bind(this, "gulp editor-config"));
    })
    .then(function() {
      return check_files();
    })
    .then(function(result) {
      for(var i = 0; i < result.length; i++) {
        h.expect(result[i].isSymbolicLink()).to.ok;
      }
    });
  });

  describe("call help", function() {
    before(function(cb) {
      runGulp("gulp help", cb);
    });

    it("should show main and sub tasks", function() {
      h.expect(result.code).to.equal(0);
      h.expect(result.out).to.match(/^\s*Main Tasks\s*$/m);
      h.expect(result.out).to.match(/^\s*Sub Tasks\s*$/m);
    });

    it("should have a clean tasks", function() {
      h.expect(result.out).to.match(/^\s*clean-lib\s*$/m);
      h.expect(result.out).to.match(/^\s*clean-lib-src\s*$/m);
      h.expect(result.out).to.match(/^\s*clean-lib-spec\s*$/m);
    });

    it("should have a babel tasks", function() {
      h.expect(result.out).to.match(/^\s*babel\s*$/m);
      h.expect(result.out).to.match(/^\s*babel-spec\s*$/m);
      h.expect(result.out).to.match(/^\s*babel-src\s*$/m);
    });

    it("should have a watch tasks", function() {
      h.expect(result.out).to.match(/^\s*mocha\s*$/m);
      h.expect(result.out).to.match(/^\s*spec\s*$/m);
    });

    it("should have a watch tasks", function() {
      h.expect(result.out).to.match(/^\s*watch\s*$/m);
      h.expect(result.out).to.match(/^\s*watch-mocha\s*$/m);
      h.expect(result.out).to.match(/^\s*watch-mocha-lint\s*$/m);
      h.expect(result.out).to.match(/^\s*watch-lint-mocha\s*$/m);
      h.expect(result.out).to.match(/^\s*watch-spec\s*$/m);
      h.expect(result.out).to.match(/^\s*watch-src\s*$/m);
    });

    it("should support extra task", function() {
      h.expect(result.out).to.match(/^\s*custom\s*$/m);
    })
  });

});
