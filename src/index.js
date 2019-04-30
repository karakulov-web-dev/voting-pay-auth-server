"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
/**
 * @author karakulov.web.dev@gmail.com
 */
var express_1 = __importDefault(require("express"));
var mongodb_1 = __importDefault(require("mongodb"));
var md5_1 = __importDefault(require("md5"));
var MongoClient = mongodb_1["default"].MongoClient;
var App = /** @class */ (function () {
    function App() {
        var _this = this;
        var bdName = encodeURIComponent("votingPay");
        var user = encodeURIComponent("votingPay");
        var password = encodeURIComponent("NoSQLBoosterMongoDBPassword123");
        var authMechanism = "DEFAULT";
        var url = "mongodb://" + user + ":" + password + "@45.76.94.35:27017/?authMechanism=" + authMechanism;
        // Create a new MongoClient
        var client = new MongoClient(url, { useNewUrlParser: true });
        // Use connect method to connect to the Server
        this.db = undefined;
        client.connect(function (err) {
            console.log("error connection to bd: ", err);
            _this.db = client.db(bdName);
        });
        var app = express_1["default"]();
        app.use(express_1["default"].json());
        app.listen(8001);
        console.log("voting-pay-auth-server started on port 8001");
        this.createApiPoint_registrationUser(app);
    }
    App.prototype.createApiPoint_registrationUser = function (app) {
        var _this = this;
        app.post("/registration-user", function (req, res) {
            (function () { return __awaiter(_this, void 0, void 0, function () {
                var result;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, this.registrationUser(req.body)];
                        case 1:
                            result = _a.sent();
                            res.send(result);
                            return [2 /*return*/];
                    }
                });
            }); })();
        });
    };
    App.prototype.registrationUser = function (registrationReqData) {
        var _this = this;
        return new Promise(function (resolve) {
            var email = registrationReqData.email, password = registrationReqData.password;
            email = typeof email === "string" ? email : "";
            password = typeof password === "string" ? password : "";
            if (!(email && password)) {
                resolve({
                    errorStatus: true,
                    errorText: "incorrect email or password",
                    AccessToken: ""
                });
            }
            if (typeof _this.db === "undefined") {
                resolve({
                    errorStatus: true,
                    errorText: "error connection db",
                    AccessToken: ""
                });
            }
            var checkExistUser = function (email) {
                return new Promise(function (resolve) {
                    if (typeof _this.db === "undefined") {
                        resolve(false);
                        return;
                    }
                    var users = _this.db.collection("vpUsers");
                    users.find({ email: email }).toArray(function (err, usersArr) {
                        if (usersArr.length > 0) {
                            resolve(true);
                        }
                        else {
                            resolve(false);
                        }
                    });
                });
            };
            (function () { return __awaiter(_this, void 0, void 0, function () {
                var userExistStatus;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, checkExistUser(email)];
                        case 1:
                            userExistStatus = _a.sent();
                            if (userExistStatus) {
                                resolve({
                                    errorStatus: true,
                                    errorText: "user already exist",
                                    AccessToken: ""
                                });
                            }
                            else {
                                resolve({
                                    errorStatus: false,
                                    errorTest: "",
                                    AccessToken: this.createUser(email, password)
                                });
                            }
                            return [2 /*return*/];
                    }
                });
            }); })();
        });
    };
    App.prototype.createUser = function (email, password) {
        if (typeof this.db === "undefined") {
            return;
        }
        var AccessToken = md5_1["default"]("prefix_" + Math.random() + "_postfix");
        var users = this.db.collection("vpUsers");
        var user = {
            email: email,
            password: password,
            AccessToken: AccessToken
        };
        users.insert(user);
        return AccessToken;
    };
    App.prototype.createApiPoint_checkAccessToken = function (app) {
        var _this = this;
        app.post("/check-access-token", function (req, res) {
            res.send(_this.checkAccessToken(req.body));
        });
    };
    App.prototype.checkAccessToken = function () { };
    App.prototype.createApiPoint_loginUser = function (app) {
        var _this = this;
        app.post("/login-user", function (req, res) {
            res.send(_this.checkAccessToken(req.body));
        });
    };
    App.prototype.loginUser = function () { };
    return App;
}());
new App();
exports["default"] = App;
