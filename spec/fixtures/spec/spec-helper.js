
require('source-map-support').install();

var Helpers = {
  expect : require('../../../../lib/chai').expect,
};

// Active support to generators
var BPromise = require('bluebird');
require("../../../../lib/generators")((fn) => BPromise.coroutine(fn)());

export default Helpers;
