import { Request, Response } from "express";
import userWaitlist from "../Models/Waitlist";
import { sendWaitlistMail } from "../Mailing/waitlistWelcome";
import xss from 'xss';
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "GEMINI_API_KEY" });

interface waitListInterface {
  addUser: (req: Request, res: Response) => Promise<Response | void>;
  getUser: (req: Request, res: Response) => Promise<Response | void>;
  deleteUser: (req: Request, res: Response) => Promise<Response | void>;
}

const waitlistActions: waitListInterface = {
  addUser: async (req: Request, res: Response) => {
    let { name, email } = req.body;

    name = xss(name);
    email = xss(email);
    
    if (!name || !email) {
      return res.status(400).json({ error: "Bad request." });
    }

    try {
      const doesUserExist = await userWaitlist.findOne({
        where: { email },
      });

      if (doesUserExist) {
        return res
          .status(409)
          .json({ error: "User already exists.", message: "You're already on the waitlist!" });
      }

      await userWaitlist.create({ name, email});
      sendWaitlistMail(email, name);

      return res
        .status(201)
        .json({ success: true, message: "Your waitlist entry has been recorded." });

    } catch (error) {
        console.error(error);
      return res
        .status(500)
        .json({ error: "Server error.", message: "Error connecting to the database." });
    }
  },

  getUser: async (req:Request, res: Response) => {
    const email =  req.params.email;

    if(!email){
        userWaitlist.findAll().then((users) => {
            return res.status(200).json({success: true, data: users});
        })
        .catch((error) => {
            return res.status(500).json({error: 'Server error.'});
        });
    }
    else{
        const user = await userWaitlist.findOne({where: {email: email}});

        if(!user){
            return res.status(404).json({error: 'User not found.'});
        }
        else{
            return res.status(200).json({success: true, data: user});
        }
    }


  },

  deleteUser : async (req, res) => {
    const email = req.query.email;

    if(!email){
      return res.status(400).json({error: "Bad request.", message: "Email is not provided."});
    }

    userWaitlist.destroy({where: {email}})
    .then(() => {
      return res.status(204).json({success: true, message: 'User deleted sucessfully.'});
    })
    .catch(() => {
      return res.status(500).json({error: "Error deleting user."});
    })
  },

};

export default waitlistActions;
