/**
 * @author karakulov.web.dev@gmail.com
 */
import express from "express";
import mongodb from "mongodb";
import md5 from "md5";
import axios from "axios";

const MongoClient = mongodb.MongoClient;

interface RegistrationReqData {
  email: string | undefined;
  password: string | undefined;
}
interface RegistrationResData {
  errorStatus: boolean;
  errorText: string;
  AccessToken: string;
}

interface CheckAccessTokenReqData {
  AccessToken: string;
}

interface CheckAccessTokenResData {
  errorStatus: boolean;
  errorText: string;
  AccessTokenStatus: boolean;
  user?: {
    id: string;
    AccessToken: string;
  };
}

interface LoginUserReqData {
  email: string;
  password: string;
}

interface LoginUserResData {
  AccessToken: string;
  errorStatus: boolean;
  errorText: string;
  user?: {
    id: string;
    AccessToken: string;
  };
}

interface RestorePasswordReqData {
  email: string;
}

interface RestorePasswordResData {
  errorStatus: boolean;
  errorText: string;
  restorePasswordSessionId: string;
}

interface VerificationCodeReqData {
  code: string;
  sessionId: string;
  newPassword?: string;
}

interface VerificationCodeResData {
  errorStatus: boolean;
  errorText: string;
  AccessToken?: string;
}

class App {
  private db: mongodb.Db | undefined;
  constructor() {
    const bdName = encodeURIComponent("votingPay");
    const user = encodeURIComponent("votingPay");
    const password = encodeURIComponent("NoSQLBoosterMongoDBPassword123");
    const authMechanism = "DEFAULT";
    const url = `mongodb://${user}:${password}@45.76.94.35:27017/?authMechanism=${authMechanism}`;
    // Create a new MongoClient
    const client = new MongoClient(url, { useNewUrlParser: true });
    // Use connect method to connect to the Server
    this.db = undefined;

    client.connect(err => {
      console.log("error connection to bd: ", err);
      this.db = client.db(bdName);
    });

    let app = express();
    app.use(express.json());

    app.listen(8001);
    console.log("voting-pay-auth-server started on port 8001");

    this.createApiPoint_registrationUser(app);
    this.createApiPoint_checkAccessToken(app);
    this.createApiPoint_loginUser(app);
    this.createApiPoint_resorePassword(app);
    this.createApiPoint_resorePasswordVerificationCode(app);
  }
  createApiPoint_registrationUser(app: express.Express) {
    app.post("/registration-user", (req, res) => {
      (async () => {
        let result: {} = await this.registrationUser(req.body as any);
        res.send(result);
      })();
    });
  }
  registrationUser(registrationReqData: RegistrationReqData) {
    return new Promise<RegistrationResData>(resolve => {
      let { email, password } = registrationReqData;
      email = typeof email === "string" ? email : "";
      password = typeof password === "string" ? password : "";
      if (!(email && password)) {
        resolve({
          errorStatus: true,
          errorText: "incorrect email or password",
          AccessToken: ""
        });
      }

      if (typeof this.db === "undefined") {
        resolve({
          errorStatus: true,
          errorText: "error connection db",
          AccessToken: ""
        });
      }

      let checkExistUser = (email: string) => {
        return new Promise(resolve => {
          if (typeof this.db === "undefined") {
            resolve(false);
            return;
          }
          const users = this.db.collection("vpUsers");
          users.find({ email }).toArray((err, usersArr) => {
            if (usersArr.length > 0) {
              resolve(true);
            } else {
              resolve(false);
            }
          });
        });
      };

      (async () => {
        let userExistStatus = await checkExistUser(email);
        if (userExistStatus) {
          resolve({
            errorStatus: true,
            errorText: "user already exist",
            AccessToken: ""
          });
        } else {
          let AccessToken = this.createUser(email, password);
          if (AccessToken) {
            resolve({
              errorStatus: false,
              errorText: "",
              AccessToken: AccessToken
            });
          } else {
            resolve({
              errorStatus: true,
              errorText: "Произошла ошибка при создании пользователя!",
              AccessToken: ""
            });
          }
        }
      })();
    });
  }
  createUser(email: string, password: string) {
    if (typeof this.db === "undefined") {
      return;
    }
    let AccessToken = this.createRandomHash();
    const users = this.db.collection("vpUsers");
    let user = {
      email,
      password,
      AccessToken
    };
    users.insertMany([user]);
    return AccessToken;
  }
  createApiPoint_checkAccessToken(app: express.Express) {
    app.post("/check-access-token", async (req, res) => {
      res.send(await this.checkAccessToken(req.body));
    });
  }
  async checkAccessToken({
    AccessToken
  }: CheckAccessTokenReqData): Promise<CheckAccessTokenResData> {
    if (!AccessToken) {
      return {
        errorStatus: true,
        errorText: "Некорректный AccessToken",
        AccessTokenStatus: false
      };
    }

    let users;
    if (this.db) {
      users = this.db.collection("vpUsers");
    }
    if (!users) {
      return {
        errorStatus: true,
        errorText: "Ошибка соединения с базой данных",
        AccessTokenStatus: false
      };
    }

    var data = await users.find({ AccessToken }).toArray();
    if (!data[0]) {
      return {
        errorStatus: true,
        errorText: "AccessToken устарел или не существует",
        AccessTokenStatus: false
      };
    } else {
      return {
        errorStatus: false,
        errorText: "",
        AccessTokenStatus: true,
        user: {
          id: data[0]._id,
          AccessToken: data[0].AccessToken
        }
      };
    }
  }
  createApiPoint_loginUser(app: express.Express) {
    app.post("/login-user", async (req, res) => {
      res.send(await this.loginUser(req.body));
    });
  }
  async loginUser({
    email,
    password
  }: LoginUserReqData): Promise<LoginUserResData> {
    if (!(email && password)) {
      return {
        AccessToken: "",
        errorStatus: true,
        errorText: "Не правильный email или пароль"
      };
    }

    let users;
    if (this.db) {
      users = this.db.collection("vpUsers");
    }
    if (!users) {
      return {
        errorStatus: true,
        errorText: "Ошибка соединения с базой данных",
        AccessToken: ""
      };
    }

    var data = await users.find({ email }).toArray();
    if (!data[0]) {
      return {
        errorStatus: true,
        errorText: "Не правильный email или пароль",
        AccessToken: ""
      };
    }

    if (data[0].password !== password) {
      return {
        errorStatus: true,
        errorText: "Не правильный email или пароль",
        AccessToken: ""
      };
    }

    return {
      errorStatus: false,
      errorText: "",
      AccessToken: data[0].AccessToken,
      user: {
        id: data[0]._id,
        AccessToken: data[0].AccessToken
      }
    };
  }

  createApiPoint_resorePassword(app: express.Express) {
    app.post("/restore-password", async (req, res) => {
      res.send(await this.restorePassword(req.body));
    });
  }
  async restorePassword({
    email
  }: RestorePasswordReqData): Promise<RestorePasswordResData> {
    let errorStatus = false;
    let errorText = "";
    let restorePasswordSessionId = this.createRandomHash();
    let restorePasswordVerificationCode = this.createRandomHash().substr(0, 5);
    let restorePasswordNumberAttempts = 0;

    if (!this.db) {
      return {
        errorStatus: true,
        errorText: "Ошибка соединения с базой данных!",
        restorePasswordSessionId: ""
      };
    }

    let users = this.db.collection("vpUsers");
    users.updateOne(
      { email },
      {
        $set: {
          restorePasswordSessionId,
          restorePasswordVerificationCode,
          restorePasswordNumberAttempts
        }
      }
    );

    let messageTextArr = [
      "Вы получили это письмо, потому что вы (или кто-то еще) запросили код подтверждения учетной записи votingpay.com",
      `Ваш код подтверждения : ${restorePasswordVerificationCode}`,
      "Если вы получили это по ошибке, вы можете спокойно проигнорировать это.",
      "VotingPay любит тебя!"
    ];

    let messageHtmlArr = messageTextArr.map(text => text);
    messageHtmlArr[1] = `<b>${messageHtmlArr[1]}</b>`;
    messageHtmlArr = messageHtmlArr.map(text => `<p>${text}</p>`);

    try {
      await axios.post("http://localhost/mail/send", {
        from: "VotingPay <admin@votingpay.com>",
        to: email,
        subject: "Восстановление пароля",
        text: messageTextArr.join(" \n"),
        html: messageHtmlArr.join("")
      });
    } catch (e) {
      return {
        errorStatus: true,
        errorText: "Внутренняя ошибка сервера: " + String(e),
        restorePasswordSessionId: ""
      };
    }

    return {
      errorStatus,
      errorText,
      restorePasswordSessionId
    };
  }
  createApiPoint_resorePasswordVerificationCode(app: express.Application) {
    app.post("/restore-password-verification-code", async (req, res) => {
      res.send(await this.resorePasswordVerificationCode(req.body));
    });
  }
  async resorePasswordVerificationCode({
    code,
    sessionId,
    newPassword
  }: VerificationCodeReqData): Promise<VerificationCodeResData> {
    if (!code || !sessionId) {
      return {
        errorStatus: true,
        errorText: "(code || sessionId) not found"
      };
    }

    if (!this.db) {
      return {
        errorStatus: true,
        errorText: "Ошибка соединения с базой данных!"
      };
    }

    let users = this.db.collection("vpUsers");

    if (!users) {
      return {
        errorStatus: true,
        errorText: "Ошибка соединения с базой данных!"
      };
    }

    let restorePasswordSessionId = sessionId;
    let data = await users.find({ restorePasswordSessionId }).toArray();

    if (!data[0]) {
      return {
        errorStatus: true,
        errorText: "Сессия не найдена или устарела."
      };
    }

    if (data[0].restorePasswordNumberAttempts > 5) {
      return {
        errorStatus: true,
        errorText: "Превышено максимальное число попыток (5)"
      };
    } else {
      let { restorePasswordNumberAttempts } = data[0];
      restorePasswordNumberAttempts++;
      users.updateOne(
        { restorePasswordSessionId },
        {
          $set: {
            restorePasswordNumberAttempts
          }
        }
      );
    }

    if (data[0].restorePasswordVerificationCode !== code) {
      return {
        errorStatus: true,
        errorText: "Не правильный код подтверждения!"
      };
    }

    if (!newPassword) {
      return {
        errorStatus: false,
        errorText: ""
      };
    }

    let AccessToken = this.createRandomHash();

    users.updateOne(
      { restorePasswordSessionId },
      {
        $set: {
          password: newPassword,
          AccessToken,
          restorePasswordSessionId: "",
          restorePasswordVerificationCode: ""
        }
      }
    );

    return {
      errorStatus: false,
      errorText: "",
      AccessToken
    };
  }

  createRandomHash() {
    return md5("prefix_" + Math.random() + "_postfix");
  }
}

new App();
export default App;
