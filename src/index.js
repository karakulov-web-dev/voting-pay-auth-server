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
var axios_1 = __importDefault(require("axios"));
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
        this.createApiPoint_checkAccessToken(app);
        this.createApiPoint_loginUser(app);
        this.createApiPoint_resorePassword(app);
        this.createApiPoint_resorePasswordVerificationCode(app);
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
                var userExistStatus, AccessToken;
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
                                AccessToken = this.createUser(email, password);
                                if (AccessToken) {
                                    resolve({
                                        errorStatus: false,
                                        errorText: "",
                                        AccessToken: AccessToken
                                    });
                                }
                                else {
                                    resolve({
                                        errorStatus: true,
                                        errorText: "Произошла ошибка при создании пользователя!",
                                        AccessToken: ""
                                    });
                                }
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
        var AccessToken = this.createRandomHash();
        var users = this.db.collection("vpUsers");
        var user = {
            email: email,
            password: password,
            AccessToken: AccessToken
        };
        users.insertMany([user]);
        return AccessToken;
    };
    App.prototype.createApiPoint_checkAccessToken = function (app) {
        var _this = this;
        app.post("/check-access-token", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = res).send;
                        return [4 /*yield*/, this.checkAccessToken(req.body)];
                    case 1:
                        _b.apply(_a, [_c.sent()]);
                        return [2 /*return*/];
                }
            });
        }); });
    };
    App.prototype.checkAccessToken = function (_a) {
        var AccessToken = _a.AccessToken;
        return __awaiter(this, void 0, void 0, function () {
            var users, data;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!AccessToken) {
                            return [2 /*return*/, {
                                    errorStatus: true,
                                    errorText: "Некорректный AccessToken",
                                    AccessTokenStatus: false
                                }];
                        }
                        if (this.db) {
                            users = this.db.collection("vpUsers");
                        }
                        if (!users) {
                            return [2 /*return*/, {
                                    errorStatus: true,
                                    errorText: "Ошибка соединения с базой данных",
                                    AccessTokenStatus: false
                                }];
                        }
                        return [4 /*yield*/, users.find({ AccessToken: AccessToken }).toArray()];
                    case 1:
                        data = _b.sent();
                        if (!data[0]) {
                            return [2 /*return*/, {
                                    errorStatus: true,
                                    errorText: "AccessToken устарел или не существует",
                                    AccessTokenStatus: false
                                }];
                        }
                        else {
                            return [2 /*return*/, {
                                    errorStatus: false,
                                    errorText: "",
                                    AccessTokenStatus: true,
                                    user: {
                                        id: data[0]._id,
                                        AccessToken: data[0].AccessToken
                                    }
                                }];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    App.prototype.createApiPoint_loginUser = function (app) {
        var _this = this;
        app.post("/login-user", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = res).send;
                        return [4 /*yield*/, this.loginUser(req.body)];
                    case 1:
                        _b.apply(_a, [_c.sent()]);
                        return [2 /*return*/];
                }
            });
        }); });
    };
    App.prototype.loginUser = function (_a) {
        var email = _a.email, password = _a.password;
        return __awaiter(this, void 0, void 0, function () {
            var users, data;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!(email && password)) {
                            return [2 /*return*/, {
                                    AccessToken: "",
                                    errorStatus: true,
                                    errorText: "Не правильный email или пароль"
                                }];
                        }
                        if (this.db) {
                            users = this.db.collection("vpUsers");
                        }
                        if (!users) {
                            return [2 /*return*/, {
                                    errorStatus: true,
                                    errorText: "Ошибка соединения с базой данных",
                                    AccessToken: ""
                                }];
                        }
                        return [4 /*yield*/, users.find({ email: email }).toArray()];
                    case 1:
                        data = _b.sent();
                        if (!data[0]) {
                            return [2 /*return*/, {
                                    errorStatus: true,
                                    errorText: "Не правильный email или пароль",
                                    AccessToken: ""
                                }];
                        }
                        if (data[0].password !== password) {
                            return [2 /*return*/, {
                                    errorStatus: true,
                                    errorText: "Не правильный email или пароль",
                                    AccessToken: ""
                                }];
                        }
                        return [2 /*return*/, {
                                errorStatus: false,
                                errorText: "",
                                AccessToken: data[0].AccessToken,
                                user: {
                                    id: data[0]._id,
                                    AccessToken: data[0].AccessToken
                                }
                            }];
                }
            });
        });
    };
    App.prototype.createApiPoint_resorePassword = function (app) {
        var _this = this;
        app.post("/restore-password", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = res).send;
                        return [4 /*yield*/, this.restorePassword(req.body)];
                    case 1:
                        _b.apply(_a, [_c.sent()]);
                        return [2 /*return*/];
                }
            });
        }); });
    };
    App.prototype.restorePassword = function (_a) {
        var email = _a.email;
        return __awaiter(this, void 0, void 0, function () {
            var errorStatus, errorText, restorePasswordSessionId, restorePasswordVerificationCode, restorePasswordNumberAttempts, users, messageTextArr, messageHtmlArr, e_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        errorStatus = false;
                        errorText = "";
                        restorePasswordSessionId = this.createRandomHash();
                        restorePasswordVerificationCode = this.createRandomHash().substr(0, 5);
                        restorePasswordNumberAttempts = 0;
                        if (!this.db) {
                            return [2 /*return*/, {
                                    errorStatus: true,
                                    errorText: "Ошибка соединения с базой данных!",
                                    restorePasswordSessionId: ""
                                }];
                        }
                        users = this.db.collection("vpUsers");
                        users.updateOne({ email: email }, {
                            $set: {
                                restorePasswordSessionId: restorePasswordSessionId,
                                restorePasswordVerificationCode: restorePasswordVerificationCode,
                                restorePasswordNumberAttempts: restorePasswordNumberAttempts
                            }
                        });
                        messageTextArr = [
                            "Вы получили это письмо, потому что вы (или кто-то еще) запросили код подтверждения учетной записи votingpay.com",
                            "\u0412\u0430\u0448 \u043A\u043E\u0434 \u043F\u043E\u0434\u0442\u0432\u0435\u0440\u0436\u0434\u0435\u043D\u0438\u044F : " + restorePasswordVerificationCode,
                            "Если вы получили это по ошибке, вы можете спокойно проигнорировать это.",
                            "VotingPay любит тебя!"
                        ];
                        messageHtmlArr = messageTextArr.map(function (text) { return text; });
                        messageHtmlArr[1] = "<b>" + messageHtmlArr[1] + "</b>";
                        messageHtmlArr = messageHtmlArr.map(function (text) { return "<p>" + text + "</p>"; });
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios_1["default"].post("http://localhost/mail/send", {
                                from: "VotingPay <admin@votingpay.com>",
                                to: email,
                                subject: "Восстановление пароля",
                                text: messageTextArr.join(" \n"),
                                html: messageHtmlArr.join("")
                            })];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        e_1 = _b.sent();
                        return [2 /*return*/, {
                                errorStatus: true,
                                errorText: "Внутренняя ошибка сервера: " + String(e_1),
                                restorePasswordSessionId: ""
                            }];
                    case 4: return [2 /*return*/, {
                            errorStatus: errorStatus,
                            errorText: errorText,
                            restorePasswordSessionId: restorePasswordSessionId
                        }];
                }
            });
        });
    };
    App.prototype.createApiPoint_resorePasswordVerificationCode = function (app) {
        var _this = this;
        app.post("/restore-password-verification-code", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _b = (_a = res).send;
                        return [4 /*yield*/, this.resorePasswordVerificationCode(req.body)];
                    case 1:
                        _b.apply(_a, [_c.sent()]);
                        return [2 /*return*/];
                }
            });
        }); });
    };
    App.prototype.resorePasswordVerificationCode = function (_a) {
        var code = _a.code, sessionId = _a.sessionId, newPassword = _a.newPassword;
        return __awaiter(this, void 0, void 0, function () {
            var users, restorePasswordSessionId, data, restorePasswordNumberAttempts, AccessToken;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!code || !sessionId) {
                            return [2 /*return*/, {
                                    errorStatus: true,
                                    errorText: "(code || sessionId) not found"
                                }];
                        }
                        if (!this.db) {
                            return [2 /*return*/, {
                                    errorStatus: true,
                                    errorText: "Ошибка соединения с базой данных!"
                                }];
                        }
                        users = this.db.collection("vpUsers");
                        if (!users) {
                            return [2 /*return*/, {
                                    errorStatus: true,
                                    errorText: "Ошибка соединения с базой данных!"
                                }];
                        }
                        restorePasswordSessionId = sessionId;
                        return [4 /*yield*/, users.find({ restorePasswordSessionId: restorePasswordSessionId }).toArray()];
                    case 1:
                        data = _b.sent();
                        if (!data[0]) {
                            return [2 /*return*/, {
                                    errorStatus: true,
                                    errorText: "Сессия не найдена или устарела."
                                }];
                        }
                        if (data[0].restorePasswordNumberAttempts > 5) {
                            return [2 /*return*/, {
                                    errorStatus: true,
                                    errorText: "Превышено максимальное число попыток (5)"
                                }];
                        }
                        else {
                            restorePasswordNumberAttempts = data[0].restorePasswordNumberAttempts;
                            restorePasswordNumberAttempts++;
                            users.updateOne({ restorePasswordSessionId: restorePasswordSessionId }, {
                                $set: {
                                    restorePasswordNumberAttempts: restorePasswordNumberAttempts
                                }
                            });
                        }
                        if (data[0].restorePasswordVerificationCode !== code) {
                            return [2 /*return*/, {
                                    errorStatus: true,
                                    errorText: "Не правильный код подтверждения!"
                                }];
                        }
                        if (!newPassword) {
                            return [2 /*return*/, {
                                    errorStatus: false,
                                    errorText: ""
                                }];
                        }
                        AccessToken = this.createRandomHash();
                        users.updateOne({ restorePasswordSessionId: restorePasswordSessionId }, {
                            $set: {
                                password: newPassword,
                                AccessToken: AccessToken,
                                restorePasswordSessionId: "",
                                restorePasswordVerificationCode: ""
                            }
                        });
                        return [2 /*return*/, {
                                errorStatus: false,
                                errorText: "",
                                AccessToken: AccessToken
                            }];
                }
            });
        });
    };
    App.prototype.createRandomHash = function () {
        return md5_1["default"]("prefix_" + Math.random() + "_postfix");
    };
    return App;
}());
new App();
exports["default"] = App;
//# sourceMappingURL=index.js.map