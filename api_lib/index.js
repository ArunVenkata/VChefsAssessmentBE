import express from 'express';
import cors from 'cors';
import { registerRoutes } from "./url_base.js";
import { setConfig } from "./internal-config-helper.js";
import { registerMiddlewares } from "./middleware_reader.js"
import dotenv from 'dotenv';
import { initMongoose } from './mongo_connection.js'
import cookieParser from 'cookie-parser';

dotenv.config();

export class Url {
  // given url path, get the appropriate app.
  // allowed formats: "appName"
  // find views file in given app folder and return all 
  params = {};
  app = null;

  constructor({ name, urlPath, routeHandler, app }) {
    if (routeHandler && app) {
      throw Error(`Error in URL '${name}': Must specify only ONE of routeHandler or app`)
    }
    this.appDotPath = app
    if (app) {
      this.app = app
    }
    this.params = { name, url: urlPath, routeHandler};
  }

  get data() {
    return this.params
  }

}

export async function runserver() {

  const baseProjectPath = process.cwd();
  setConfig({ baseProjectPath });

  const app = express();
  app.use(express.json());

  app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Headers", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
  app.use((req, res, next) => {
    res.Response = res.Response.bind(res);
    next();
  });

  app.use(cors({
    origin: (origin, callback) => {
      return callback(null, true);
    },
    credentials: true
  }));
  app.use(cookieParser());
 

  await registerMiddlewares(app);
  await registerRoutes({ express_app: app });
  await initMongoose()

  const PORT = process.env.PORT || 3000;
  express.response.Response = function (data, status = 200) {
    return this.status(status).json(data);
  };



 // For invalid URLs
 app.use((request, response) => {
  response.status(404).json({ error: "Invalid API request" });
});
  

  const listener = app.listen(PORT, function () {
    console.log('Your app is listening on port ' + listener.address().port);
  });
}
