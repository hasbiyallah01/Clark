"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_controller_1 = __importDefault(require("./Controllers/auth.controller"));
const user_controller_1 = __importDefault(require("./Controllers/user.controller"));
const waitlist_controller_1 = __importDefault(require("./Controllers/waitlist.controller"));
const Auth_middleware_1 = __importDefault(require("./Middlewares/Auth.middleware"));
const sanitizeRequest_middleware_1 = require("./Middlewares/sanitizeRequest.middleware");
const Multer_services_1 = require("./Services/Multer.services");
const Sequelize_1 = __importDefault(require("./config/Sequelize"));
const express = require("express");
const dotenv = require("dotenv");
const session = require("express-session");
const cors = require("cors");
var bodyParser = require("body-parser");
const app = express();
dotenv.config();
const FRONTEND_URL = process.env.FRONTEND_URL;
const PORT = process.env.PORT || 8000;
const allowedCorsUrls = FRONTEND_URL
    ? FRONTEND_URL.split(',')
    : [];
console.log(allowedCorsUrls);
const corsOption = {
    origin: allowedCorsUrls,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOption));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(session({
    secret: process.env.SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV == 'dev' ? 'false' : 'true' },
}));
app.use(sanitizeRequest_middleware_1.sanitizeRequestBody); // Sanitize request body middleware
// Auth Routes
app.post("/api/v1/login", auth_controller_1.default.login);
app.post("/api/v1/signup", auth_controller_1.default.signup);
app.get("/api/v1/waitlist/:email?", waitlist_controller_1.default.getUser);
app.post("/api/v1/waitlist", waitlist_controller_1.default.addUser);
app.delete("/api/v1/waitlist", waitlist_controller_1.default.deleteUser);
app.post("/api/v1/askQuestion", Auth_middleware_1.default.verifyToken, user_controller_1.default.askQuestion);
app.post("/api/v1/workspace", Auth_middleware_1.default.verifyToken, user_controller_1.default.createWorkspace);
app.get("/api/v1/workspace/:id?", Auth_middleware_1.default.verifyToken, user_controller_1.default.getWorkspace);
app.post("/api/v1/files", Auth_middleware_1.default.verifyToken, Multer_services_1.upload.array('files', 10), user_controller_1.default.addFiles);
app.post("/api/v1/generateMaterial", Auth_middleware_1.default.verifyToken, user_controller_1.default.generateMaterial);
app.post("/api/v1/generateQuiz", Auth_middleware_1.default.verifyToken, user_controller_1.default.generateQuiz);
app.post("/api/v1/generateFlashcards", Auth_middleware_1.default.verifyToken, user_controller_1.default.generateFlashcards);
app.get("/api/v1/youtube/:id?", Auth_middleware_1.default.verifyToken, user_controller_1.default.getYoutubeVideo);
console.log("starting server...");
const startServer = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield Sequelize_1.default.authenticate();
        console.log("DB connection established");
        yield Sequelize_1.default.sync({ alter: true });
        console.log("Database synced");
        app.listen(PORT, () => {
            console.log(`Server is listening on port: ${PORT}`);
        });
    }
    catch (error) {
        console.error("Startup error:", error);
    }
});
startServer();
