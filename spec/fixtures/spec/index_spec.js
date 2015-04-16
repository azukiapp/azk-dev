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

  it("should support generators", function() {
    return h.expect(MyClass.delay()).to.eventually.equal(true);
  });
});
