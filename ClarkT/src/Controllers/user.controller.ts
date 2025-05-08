import { Request, Response } from "express";
import User from "../Models/User";
import Workspace from "../Models/Workspace";
import { GoogleGenAI, Type } from "@google/genai";
import axios from "axios";
import { uploadFile } from "../Services/Cloudflare.services";
import { v5 as uuidv5 } from "uuid";
import PDFFiles from "../Models/PDFFile";
import { prefileInterface } from "../Interfaces/Index";
import ImageFiles from "../Models/ImageFile";

interface userActionsInterface {
  createWorkspace: (
    req: Request & afterVerificationMiddlerwareInterface,
    res: Response
  ) => Promise<Response | void>;
  askQuestion: (
    req: Request & afterVerificationMiddlerwareInterface,
    res: Response
  ) => Promise<Response | void>;
  generateMaterial: (
    req: Request & afterVerificationMiddlerwareInterface,
    res: Response
  ) => Promise<Response | void>;
  addFiles: (
    req: Request & afterVerificationMiddlerwareInterface,
    res: Response
  ) => Promise<Response | void>;
  generateQuiz: (
    req: Request & afterVerificationMiddlerwareInterface,
    res: Response
  ) => Promise<Response | void>;
  generateFlashcards: (
    req: Request & afterVerificationMiddlerwareInterface,
    res: Response
  ) => Promise<Response | void>;
}

interface afterVerificationMiddlerwareInterface {
  user: {
    id: number;
    name: string;
    email: string;
  };
}

const API_KEY = process.env.GEMINI_API_KEY || "GEMINI_API_KEY";
const ai = new GoogleGenAI({
  apiKey: API_KEY,
});

const userActions: userActionsInterface = {
  createWorkspace: async (
    req: Request & afterVerificationMiddlerwareInterface,
    res: Response
  ) => {
    const { name } = req.body;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: "Unauthorized access." });
    }

    if (!name) {
      return res.status(400).json({ error: "Bad request." });
    }

    try {
      Workspace.create({
        name: name,
        userId: user.id,
      })
        .then((workspace) => {
          const hashedWorkspaceId = uuidv5(
            workspace.id.toString(),
            process.env.UUID_SECRET as string
          );
          return res.status(201).json({
            success: true,
            message: "Workspace created successfully.",
            workspace_id: hashedWorkspaceId,
          });
        })
        .catch((error) => {
          console.error("Error creating workspace:", error);
          return res.status(500).json({
            error: "Server error.",
            message: "Error creating workspace.",
          });
        });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server error." });
    }
  },

  askQuestion: async (
    req: Request & afterVerificationMiddlerwareInterface,
    res: Response
  ) => {
    let { question, workspace_id, thinking } = req.body;

    question = `Based on the following documents and additional images provided, answer the question: ${question}. Go through all documents and images extensively and provide a detailed answer. If the answer is not available in the documents, please state that. Make sure to go through all additional images extensively too.`;

    if (!question || !workspace_id) {
      return res.status(400).json({ error: "Bad request." });
    }

    if (!thinking) {
      thinking = false;
    }

    const pdfFiles = await PDFFiles.findAll({
      where: { workspaceId: workspace_id },
      attributes: ["filePath"],
    });

    const imageFiles = await ImageFiles.findAll({
      where: { workspaceId: workspace_id },
      attributes: ["filePath"],
    });

    async function analyzeDocumentsAndImages() {
      const parts: any[] = [];

      // Add the user's question as a prompt
      parts.push({ text: question });

      // Add PDFs
      for (const file of pdfFiles) {
        const pdfResp = await axios.get(file.filePath, {
          responseType: "arraybuffer",
        });
        parts.push({
          inlineData: {
            mimeType: "application/pdf",
            data: Buffer.from(pdfResp.data).toString("base64"),
          },
        });
      }

      // Add Images
      for (const file of imageFiles) {
        const imageResp = await axios.get(file.filePath, {
          responseType: "arraybuffer",
        });
        parts.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: Buffer.from(imageResp.data).toString("base64"),
          },
        });
      }

      const response = await ai.models.generateContent({
        model:
          thinking == true
            ? (process.env.THINKING_MODEL as string)
            : (process.env.REGULAR_MODEL as string),
        contents: [
          {
            role: "user",
            parts: parts,
          },
        ],
      });

      res.setHeader("Content-Type", "text/plain");
      res.send(response.text);
    }

    analyzeDocumentsAndImages();
  },

  generateMaterial: async (req: Request, res: Response) => {
    const { topic } = req.body;

    if (!topic) {
      return res.status(400).json({ error: "Bad request." });
    }

    try {
      const prompt = `Generate an extremely comprehensive, well-structured, and highly detailed PDF guide in Markdown format that fully explains the topic "${topic}" in a way that is accessible and easy for a student to understand. The guide should be long (at least 5,000–10,000 words if necessary), educational, and rich in content.
                            The document should:
                            Start with a detailed introduction, explaining the topic’s background, importance, and real-world applications.
                            Provide precise definitions of all key terms and concepts, with contextual explanations.
                            Break down complex ideas into simple, digestible parts, using analogies, storytelling, and practical examples.
                            Include visual aids (diagrams, illustrations, tables, or charts), or clearly indicate where such visuals should be placed.
                            Give step-by-step explanations for processes, workflows, formulas, or problem-solving techniques, with sample problems and solutions where appropriate.
                            Include real-life use cases, industry practices, and related case studies to strengthen understanding.
                            Provide revision tables, mnemonics, or summarized charts for key points.
                            Include a FAQ section addressing likely student questions, misconceptions, or confusions.
                            End with a recap of key takeaways, glossary, further reading suggestions, and practice questions or exercises with solutions.
                            The tone should be engaging, clear, and student-friendly, assuming no prior expertise in the subject.
                            Use proper formatting: section headings, subheadings, bullet points, code blocks (if applicable), and spacing for high readability.
                            Make sure the guide is long enough to serve as a standalone learning resource or mini-textbook on the topic.`;

      const ai = new GoogleGenAI({ apiKey: API_KEY });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-04-17",
        contents: prompt,
      });

      const text = response.text;
      res.setHeader("Content-Type", "text/plain");
      res.send(response.text);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server error." });
    }
  },

  addFiles: async (
    req: Request & afterVerificationMiddlerwareInterface,
    res: Response
  ) => {
    try {
      const { workspaceId } = req.body;
      const user = req.user;
      let files: prefileInterface[] = [];

      if (!user) {
        return res.status(401).json({ error: "Unauthorized access." });
      }

      if (!workspaceId) {
        return res.status(400).json({ error: "Bad request." });
      }

      const hashedWorkspaceId = uuidv5(
        workspaceId,
        process.env.UUID_SECRET as string
      );
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return res.status(400).json({ error: "No files uploaded" });
      }

      const bucket = hashedWorkspaceId;

      const uploadPromises = (req.files as Express.Multer.File[]).map(
        (file) => {
          let key = `${Date.now()}_${file.originalname}`;
          const mimeType = file.mimetype;

          if (!mimeType.includes("pdf") && !mimeType.includes("image")) {
            return res.status(400).json({
              error: "Invalid file type. Only PDF and image files are allowed.",
            });
          } else {
            key = key.replace(/[^a-zA-Z0-9.]/g, "_");

            let preFile: prefileInterface = {
              mimetype: mimeType,
              url: `https://${process.env.R2_ENDPOINT_DOMAIN}/${bucket}/${key}`,
              workspaceId: workspaceId,
            };
            files.push(preFile);
          }

          return uploadFile(
            hashedWorkspaceId,
            bucket,
            key,
            file.buffer,
            mimeType
          );
        }
      );

      const urls = await Promise.all(uploadPromises);

      files.forEach((file, index) => {
        if (file.mimetype.includes("pdf")) {
          PDFFiles.create({
            workspaceId: file.workspaceId,
            userId: user.id,
            filePath: file.url,
          });
        } else if (file.mimetype.includes("image")) {
          ImageFiles.create({
            workspaceId: file.workspaceId,
            userId: user.id,
            filePath: file.url,
          });
        }
      });

      return res.status(200).json({
        message: "Files uploaded successfully.",
        urls,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server error." });
    }
  },

  generateQuiz: async (
    req: Request & afterVerificationMiddlerwareInterface,
    res: Response
  ) => {  
    const { workspace_id, size } = req.body;

    if (!workspace_id || !size) {
      return res.status(400).json({ error: "Bad request." });
    }

    try {
      const pdfFiles = await PDFFiles.findAll({
        where: { workspaceId: workspace_id },
        attributes: ["filePath"],
      });
  
      const imageFiles = await ImageFiles.findAll({
        where: { workspaceId: workspace_id },
        attributes: ["filePath"],
      });
  
      const prompt = `Generate a quiz with ${size} questions and answers on the provided documenst alongside the images provided. Go through all documents and images extensively to make sure you set questions from everywhere if possible.`;
      const parts: any[] = [];
  
      parts.push({ text: prompt });

      // Add PDFs
      for (const file of pdfFiles) {
        const pdfResp = await axios.get(file.filePath, {
          responseType: "arraybuffer",
        });
        parts.push({
          inlineData: {
            mimeType: "application/pdf",
            data: Buffer.from(pdfResp.data).toString("base64"),
          },
        });
      }

      // Add Images
      for (const file of imageFiles) {
        const imageResp = await axios.get(file.filePath, {
          responseType: "arraybuffer",
        });
        parts.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: Buffer.from(imageResp.data).toString("base64"),
          },
        });
      }

      const response = await ai.models.generateContent({
        model: process.env.THINKING_MODEL as string,
        contents: [
          {
            role: "user",
            parts: parts,
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            description: "List of quiz questions with options and correct answers.",
            items: {
              type: Type.OBJECT,
              properties: {
                question: {
                  type: Type.STRING,
                  description: "The quiz question.",
                  nullable: false,
                },
                options: {
                  type: Type.ARRAY,
                  description: "Multiple choice answer options.",
                  items: {
                    type: Type.STRING,
                  },
                  nullable: false,
                },
                correct_answer: {
                  type: Type.STRING,
                  description: "The correct answer from the options.",
                  nullable: false,
                },
                explanation: {
                  type: Type.STRING,
                  description: "explanation why the correct answer is the correct answer based on what is in the documents and additional images provided. Make sure to describe the document reference and the image reference too.",
                  nullable: false,
                },
              },
              required: ["question", "options", "correct_answer", "explanation"],
            },
          }
          
        },
      });

      res.setHeader("Content-Type", "application/json");
      res.send(response.text);
      
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server error." });
    }
  },

  generateFlashcards: async ( 
    req: Request & afterVerificationMiddlerwareInterface,
    res: Response
  ) => {
    const { workspace_id, size } = req.body;

    if (!workspace_id || !size) {
      return res.status(400).json({ error: "Bad request." });
    }

    try {
      const pdfFiles = await PDFFiles.findAll({
        where: { workspaceId: workspace_id },
        attributes: ["filePath"],
      });
  
      const imageFiles = await ImageFiles.findAll({
        where: { workspaceId: workspace_id },
        attributes: ["filePath"],
      });
  
      const prompt = `Generate a ${size} of flashcard based on the provided documenst alongside the images provided. Go through all documents and images extensively to make sure you set questions from everywhere if possible.`;
      const parts: any[] = [];
  
      parts.push({ text: prompt });

      // Add PDFs
      for (const file of pdfFiles) {
        const pdfResp = await axios.get(file.filePath, {
          responseType: "arraybuffer",
        });
        parts.push({
          inlineData: {
            mimeType: "application/pdf",
            data: Buffer.from(pdfResp.data).toString("base64"),
          },
        });
      }

      // Add Images
      for (const file of imageFiles) {
        const imageResp = await axios.get(file.filePath, {
          responseType: "arraybuffer",
        });
        parts.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: Buffer.from(imageResp.data).toString("base64"),
          },
        });
      }

      const response = await ai.models.generateContent({
        model: process.env.THINKING_MODEL as string,
        contents: [
          {
            role: "user",
            parts: parts,
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            description: "List of flashcards with questions and answers.",
            items: {
              type: Type.OBJECT,
              properties: {
                question: {
                  type: Type.STRING,
                  description:
                    "The question or prompt on one side of the flashcard.",
                  nullable: false,
                },
                answer: {
                  type: Type.STRING,
                  description:
                    "The answer or explanation on the other side of the flashcard.",
                  nullable: false,
                },
              },
              required: ["question", "answer"],
            },
          }
        },
      });

      res.setHeader("Content-Type", "application/json");
      res.send(response.text);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: "Server error." });
    }
  }


};

export default userActions;
