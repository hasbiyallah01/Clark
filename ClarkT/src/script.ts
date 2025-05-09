import AuthController from "./Controllers/auth.controller";
import userActions from "./Controllers/user.controller";
import waitlistActions from "./Controllers/waitlist.controller";
import middleware from "./Middlewares/Auth.middleware";
import { sanitizeRequestBody } from "./Middlewares/sanitizeRequest.middleware";
import { upload } from "./Services/Multer.services";
import sequelize from "./config/Sequelize";

const express = require("express");
const dotenv = require("dotenv");
const session = require("express-session");
const cors = require("cors");
var bodyParser = require("body-parser");

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
    cookie: { secure: process.env.NODE_ENV == 'dev' ? 'false' : 'true' },
  })
);

app.use(sanitizeRequestBody);  // Sanitize request body middleware


// Auth Routes
app.post("/api/v1/login", AuthController.login);
app.post("/api/v1/signup", AuthController.signup);

app.get("/api/v1/waitlist/:email?", waitlistActions.getUser);
app.post("/api/v1/waitlist", waitlistActions.addUser);
app.delete("/api/v1/waitlist", waitlistActions.deleteUser);


app.post("/api/v1/askQuestion", middleware.verifyToken, userActions.askQuestion);
app.post("/api/v1/workspace", middleware.verifyToken, userActions.createWorkspace);
app.get("/api/v1/workspace/:id?", middleware.verifyToken, userActions.getWorkspace);

app.post("/api/v1/files", middleware.verifyToken, upload.array('files', 10), userActions.addFiles);

app.post("/api/v1/generateMaterial", middleware.verifyToken, userActions.generateMaterial);
app.post("/api/v1/generateQuiz", middleware.verifyToken, userActions.generateQuiz);
app.post("/api/v1/generateFlashcards", middleware.verifyToken, userActions.generateFlashcards);

app.get("/api/v1/youtube/:id?", middleware.verifyToken, userActions.getYoutubeVideo);

console.log("starting server...");


const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("DB connection established");

    await sequelize.sync({ alter: true });
    console.log("Database synced");

    app.listen(PORT, () => {
      console.log(`Server is listening on port: ${PORT}`);
    });
  } catch (error) {
    console.error("Startup error:", error);
  }
};

startServer();