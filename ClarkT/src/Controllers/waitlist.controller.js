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
const Waitlist_1 = __importDefault(require("../Models/Waitlist"));
const waitlistWelcome_1 = require("../Mailing/waitlistWelcome");
const xss_1 = __importDefault(require("xss"));
const genai_1 = require("@google/genai");
const ai = new genai_1.GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "GEMINI_API_KEY" });
const waitlistActions = {
    addUser: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        let { name, email } = req.body;
        name = (0, xss_1.default)(name);
        email = (0, xss_1.default)(email);
        if (!name || !email) {
            return res.status(400).json({ error: "Bad request." });
        }
        try {
            const doesUserExist = yield Waitlist_1.default.findOne({
                where: { email },
            });
            if (doesUserExist) {
                return res
                    .status(409)
                    .json({ error: "User already exists.", message: "You're already on the waitlist!" });
            }
            yield Waitlist_1.default.create({ name, email });
            (0, waitlistWelcome_1.sendWaitlistMail)(email, name);
            return res
                .status(201)
                .json({ success: true, message: "Your waitlist entry has been recorded." });
        }
        catch (error) {
            console.error(error);
            return res
                .status(500)
                .json({ error: "Server error.", message: "Error connecting to the database." });
        }
    }),
    getUser: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const email = req.params.email;
        if (!email) {
            Waitlist_1.default.findAll().then((users) => {
                return res.status(200).json({ success: true, data: users });
            })
                .catch((error) => {
                return res.status(500).json({ error: 'Server error.' });
            });
        }
        else {
            const user = yield Waitlist_1.default.findOne({ where: { email: email } });
            if (!user) {
                return res.status(404).json({ error: 'User not found.' });
            }
            else {
                return res.status(200).json({ success: true, data: user });
            }
        }
    }),
    deleteUser: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const email = req.query.email;
        if (!email) {
            return res.status(400).json({ error: "Bad request.", message: "Email is not provided." });
        }
        Waitlist_1.default.destroy({ where: { email } })
            .then(() => {
            return res.status(204).json({ success: true, message: 'User deleted sucessfully.' });
        })
            .catch(() => {
            return res.status(500).json({ error: "Error deleting user." });
        });
    }),
};
exports.default = waitlistActions;
