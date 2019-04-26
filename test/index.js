"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var chai_1 = require("chai");
var index_1 = __importDefault(require("../src/index"));
describe("App", function () {
    describe("main()", function () {
        it("должна возвращать 0", function () {
            var result = index_1["default"].main();
            chai_1.assert.strictEqual(result, 0, "\u0434\u043E\u043B\u0436\u043D\u0430 \u0432\u043E\u0437\u0432\u0440\u0430\u0449\u0430\u0442\u044C 0, \u043D\u043E \u0432\u0435\u0440\u043D\u0443\u043B\u0430 " + result);
        });
    });
});
