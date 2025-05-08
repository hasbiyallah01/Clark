import waitlistActions from "./Controllers/WaitlistController";

const express = require("express");
const dotenv = require("dotenv");
const session = require("express-session");
const cors = require("cors");
var bodyParser = require("body-parser");
const sequelize = require("./Setup/Sequelize.ts");

const app = express();
dotenv.config();

const FRONTEND_URL: any = process.env.FRONTEND_URL;
const PORT = process.env.PORT || 8000;

interface corsInterface {
  origin: string;
  methods: string[];
  allowedHeaders?: string[];
}

const allowedCorsUrls = FRONTEND_URL
    ? FRONTEND_URL.split(',')
    : [];

    console.log(allowedCorsUrls)

const corsOption: corsInterface = {
  origin: allowedCorsUrls,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOption));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(
  session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, //TO-DO: Set to true in production
  })
);

app.get("/api/v1/waitlist/:email?", waitlistActions.getUser);
app.post("/api/v1/waitlist", waitlistActions.addUser);
app.delete("/api/v1/waitlist", waitlistActions.deleteUser);

const startServer = async() => {
  try {
    await sequelize.sync({ alter: true });
    app.listen(PORT, () => {
      console.log(`Server is listening on port: ${PORT}`);
    });
  } catch (error) {
    console.error(error)
  }
}

startServer();