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
}

new App();
export default App;
