/**
 * @author karakulov.web.dev@gmail.com
 */
import express from "express";
import mongodb from "mongodb";
import md5 from "md5";
import { access } from "fs";

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
  email: string;
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
    let AccessToken = md5("prefix_" + Math.random() + "_postfix");
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
    let restorePasswordSessionId = md5(String(Math.random()).slice(2, 18));

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
          restorePasswordSessionId
        }
      }
    );

    return {
      errorStatus,
      errorText,
      restorePasswordSessionId
    };
  }
}

new App();
export default App;
