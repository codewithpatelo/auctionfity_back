import express from "express";
import bodyParser from "body-parser";

import * as dotenv from "dotenv";

dotenv.config();

import { routes } from "./routes";

const app = express();
const PORT = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.send("Auctionfity Offchain API");
});

routes.forEach((route) => {
  const { method, path, middleware, handler } = route;
  app[method](path, ...middleware, handler);
});

app.listen(PORT, () => {
  console.log(`Cheap Auction House: http://localhost:${PORT}`);
});
