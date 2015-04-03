import h from './spec-helper';
import { MyClass } from '../src';

describe("MyClass", function() {
  it("should divide", function() {
    h.expect(MyClass.divide(10, 5)).to.equal(2);
  });
});
