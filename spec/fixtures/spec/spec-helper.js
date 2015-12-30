
require('source-map-support').install();

var Helpers = {
  expect : require('../../../../chai').expect,
};

// Active support to generators
var BPromise = require('bluebird');
require("../../../../generators")((fn) => BPromise.coroutine(fn)());

export default Helpers;
