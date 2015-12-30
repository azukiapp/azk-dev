import h from './spec-helper';
import { MyClass } from '../src';
import { Other } from '../src/other';

describe("MyClass", function() {
  it("should create a instance", function() {
    var instance = new MyClass();
    h.expect(instance).to.instanceof(MyClass);
    h.expect(instance).to.instanceof(Other);
  });

  it("should divide", function() {
    h.expect(MyClass.divide(10, 5)).to.equal(2);
  });

  describe("called for promises methods", function() {
    var result = false;
    beforeEach(() => result = false)
    afterEach(()  => h.expect(result).to.ok);

    it("should support generators", function() {
      return MyClass.delay().then((r) => {
        result = r;
      });
    });

    it("should support generators in tests", function* () {
      result = yield MyClass.delay();
    });
  });
});
