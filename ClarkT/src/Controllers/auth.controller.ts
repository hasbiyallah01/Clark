import { Request, Response } from "express";
import User from "../Models/User";
import bcrypt from "bcrypt";
const jwt = require("jsonwebtoken");

interface AuthControllerInterface {
    login: (req: Request, res: Response) => Promise<Response | void>;
    signup: (req: Request, res: Response) => Promise<Response | void>;
}


const AuthController: AuthControllerInterface = {
    login: async (req: Request, res: Response) => {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: "Bad request." });
        }

        try {
            const user = await User.findOne({
                where: { email },
                attributes: { exclude: ['password', 'createdAt', 'updatedAt'] }
              });
            if (!user) {
                return res.status(401).json({ error: "Unauthorized access." });
            }

            const isPasswordValid = await bcrypt.compare(password, user._model.dataValues.password);
            if (!isPasswordValid) {
                return res.status(401).json({ error: "Unauthorized access." });
            }

            console.log(user)
            const token = jwt.sign(user, process.env.SECRET_KEY, {
                expiresIn: "90d",
            });

            return res.status(200).json({
                success: true,
                message: "Login successful.",
                user: user,
                toke: token,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Server error." });
        }
    },

    signup: async (req: Request, res: Response) => {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ error: "Bad request." });
        }

        try {
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(409).json({ error: "User already exists." });
            }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ error: "Invalid email format." });
            }
            
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await User.create({
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
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Server error." });
        }
    }
}

export default AuthController;