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
const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.SECRET_KEY;
const AuthMiddleware = {
    verifyToken: (req, res, next) => {
        var _a;
        const token = (_a = req.headers['authorization']) === null || _a === void 0 ? void 0 : _a.split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'Unauthorized access.' });
        }
        jwt.verify(token, SECRET_KEY, (err, decoded) => __awaiter(void 0, void 0, void 0, function* () {
            if (err) {
                return res.status(401).json({ message: 'Unauthorized access.' });
            }
            req.user = decoded;
            const email = decoded === null || decoded === void 0 ? void 0 : decoded.email;
            if (!email) {
                return res.status(401).json({ success: false, error: "Unauthorized access." });
            }
            const user = yield User_1.default.findOne({ where: { email } });
            if (!user) {
                return res.status(401).json({ success: false, error: "Unauthorized access." });
            }
            next();
        }));
    }
};
exports.default = AuthMiddleware;
