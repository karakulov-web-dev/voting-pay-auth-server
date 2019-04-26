import { assert } from "chai";
import App from "../src/index";

describe("App", function() {
  describe("main()", function() {
    it("должна возвращать 0", function() {
      let result = App.main();
      assert.strictEqual(
        result,
        0,
        `должна возвращать 0, но вернула ${result}`
      );
    });
  });
});
