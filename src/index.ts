/**
 * @author karakulov.web.dev@gmail.com
 */
import express from "express";
import mongodb from "mongodb";
import md5 from "md5";

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
  }
  createApiPoint_registrationUser(app: express.Express) {
    app.post("/registration-user", (req, res) => {
      (async () => {
        let result = await this.registrationUser(req.body as any);
        res.send(result);
      })();
    });
  }
  registrationUser(registrationReqData: RegistrationReqData) {
    return new Promise(resolve => {
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
          resolve({
            errorStatus: false,
            errorTest: "",
            AccessToken: this.createUser(email, password)
          });
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
    users.insert(user);
    return AccessToken;
  }
  createApiPoint_checkAccessToken(app: express.Express) {
    app.post("/check-access-token", (req, res) => {
      res.send(this.checkAccessToken(req.body));
    });
  }
  checkAccessToken() {}
  createApiPoint_loginUser(app: express.Express) {
    app.post("/login-user", (req, res) => {
      res.send(this.checkAccessToken(req.body));
    });
  }
  loginUser() {}
}

new App();
export default App;
