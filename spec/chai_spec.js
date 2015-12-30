var h = require('./spec-helper');
var Promise = require('bluebird');

describe("azk-dev chai", function() {
  describe("with a set and a subset", function() {
    var set = { a: 1, b: { c: 2}};
    var subset = { b: { c: 2 } };

    it("should support subset", function() {
      h.expect(set).to.containSubset(subset);
    });

    it("should support subset in promise", function() {
      var result = Promise.resolve(set);
      h.expect(result).to.eventually.to.containSubset(subset);
    });
  });
});
