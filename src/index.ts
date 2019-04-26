/**
 * @author karakulov.web.dev@gmail.com
 */
import express from "express";

class App {
  constructor() {
    let app = express();
    app.use(express.json());

    app.listen(8001);
    console.log("voting-pay-auth-server started on port 8001");
  }
  createApiPoint_registrationUser(app: express.Express) {
    app.post("/registration-user", (req, res) => {
      res.send(this.registrationUser());
    });
  }
  registrationUser() {
    return {
      errorStatus: false,
      errorText: "",
      AccessToken: "validToken"
    };
  }
}

new App();
export default App;
