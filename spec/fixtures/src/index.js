var Promise = require('bluebird');

// Simple example of the es6 code
export class MyClass {
  static divide(x, y) {
    return x / y;
  }

  static delay() {
    return Promise.coroutine(function* () {
      yield Promise.delay(100);
      return true;
    })();
  }
}
