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
const User_1 = __importDefault(require("../Models/User"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jwt = require("jsonwebtoken");
const AuthController = {
    login: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Bad request." });
        }
        try {
            const user = yield User_1.default.findOne({
                where: { email },
                attributes: { exclude: ['password', 'createdAt', 'updatedAt'] }
            });
            if (!user) {
                return res.status(401).json({ error: "Unauthorized access." });
            }
            const isPasswordValid = yield bcrypt_1.default.compare(password, user._model.dataValues.password);
            if (!isPasswordValid) {
                return res.status(401).json({ error: "Unauthorized access." });
            }
            console.log(user);
            const token = jwt.sign(user, process.env.SECRET_KEY, {
                expiresIn: "90d",
            });
            return res.status(200).json({
                success: true,
                message: "Login successful.",
                user: user,
                toke: token,
            });
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Server error." });
        }
    }),
    signup: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: "Bad request." });
        }
        try {
            const existingUser = yield User_1.default.findOne({ where: { email } });
            if (existingUser) {
                return res.status(409).json({ error: "User already exists." });
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ error: "Invalid email format." });
            }
            const hashedPassword = yield bcrypt_1.default.hash(password, 10);
            const user = yield User_1.default.create({
                name,
                email,
                password: hashedPassword,
            });
            delete user.dataValues.password;
            delete user.dataValues.createdAt;
            delete user.dataValues.updatedAt;
            const token = jwt.sign(user.dataValues, process.env.SECRET_KEY, {
                expiresIn: "90d",
            });
            return res.status(201).json({
                success: true,
                message: "User created successfully.",
                user: user,
                token: token,
            });
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Server error." });
        }
    })
};
exports.default = AuthController;
