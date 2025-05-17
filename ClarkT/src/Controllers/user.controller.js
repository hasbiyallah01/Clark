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
const Workspace_1 = __importDefault(require("../Models/Workspace"));
const genai_1 = require("@google/genai");
const axios_1 = __importDefault(require("axios"));
const Cloudflare_services_1 = require("../Services/Cloudflare.services");
const uuid_1 = require("uuid");
const PDFFile_1 = __importDefault(require("../Models/PDFFile"));
const ImageFile_1 = __importDefault(require("../Models/ImageFile"));
const fileFormat_util_1 = require("../utils/fileFormat.util");
const API_KEY = process.env.GEMINI_API_KEY || "GEMINI_API_KEY";
const ai = new genai_1.GoogleGenAI({
    apiKey: API_KEY,
});
const userActions = {
    createWorkspace: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { name } = req.body;
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: "Unauthorized access." });
        }
        if (!name) {
            return res.status(400).json({ error: "Bad request." });
        }
        try {
            Workspace_1.default.create({
                name: name,
                userId: user.id,
            })
                .then((workspace) => {
                const hashedWorkspaceId = (0, uuid_1.v5)(workspace.id.toString(), process.env.UUID_SECRET);
                Workspace_1.default.update({ enc_id: hashedWorkspaceId }, { where: { id: workspace.id } });
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
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Server error." });
        }
    }),
    askQuestion: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        let { question, workspace_id, thinking } = req.body;
        question = `Based on the following documents and additional images provided, answer the question: ${question}. Go through all documents and images extensively and provide a detailed answer. If the answer is not available in the documents, please state that. Make sure to go through all additional images extensively too.`;
        if (!question || !workspace_id) {
            return res.status(400).json({ error: "Bad request." });
        }
        if (!thinking) {
            thinking = false;
        }
        const pdfFiles = yield PDFFile_1.default.findAll({
            where: { workspaceId: workspace_id },
            attributes: ["filePath"],
        });
        const imageFiles = yield ImageFile_1.default.findAll({
            where: { workspaceId: workspace_id },
            attributes: ["filePath"],
        });
        function analyzeDocumentsAndImages() {
            return __awaiter(this, void 0, void 0, function* () {
                const parts = [];
                // Add the user's question as a prompt
                parts.push({ text: question });
                // Add PDFs
                for (const file of pdfFiles) {
                    const pdfResp = yield axios_1.default.get(file.filePath, {
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
                    const imageResp = yield axios_1.default.get(file.filePath, {
                        responseType: "arraybuffer",
                    });
                    parts.push({
                        inlineData: {
                            mimeType: "image/jpeg",
                            data: Buffer.from(imageResp.data).toString("base64"),
                        },
                    });
                }
                const response = yield ai.models.generateContent({
                    model: thinking == true
                        ? process.env.THINKING_MODEL
                        : process.env.REGULAR_MODEL,
                    contents: [
                        {
                            role: "user",
                            parts: parts,
                        },
                    ],
                });
                res.setHeader("Content-Type", "text/plain");
                res.send(response.text);
            });
        }
        analyzeDocumentsAndImages();
    }),
    generateMaterial: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
            const ai = new genai_1.GoogleGenAI({ apiKey: API_KEY });
            const response = yield ai.models.generateContent({
                model: "gemini-2.5-flash-preview-04-17",
                contents: prompt,
            });
            const text = response.text;
            res.setHeader("Content-Type", "text/plain");
            res.send(response.text);
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Server error." });
        }
    }),
    addFiles: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            const { workspace_id } = req.body;
            const user = req.user;
            let files = [];
            if (!user) {
                return res.status(401).json({ error: "Unauthorized access." });
            }
            if (!workspace_id) {
                return res.status(400).json({ error: "Bad request." });
            }
            const workspaceExists = yield Workspace_1.default.findOne({
                where: { enc_id: workspace_id, userId: user.id },
                attributes: ["id"],
            });
            if (!workspaceExists) {
                return res.status(404).json({ error: "Workspace not found." });
            }
            if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
                return res.status(400).json({ error: "No files uploaded" });
            }
            const bucket = workspace_id;
            const uploadPromises = req.files.map((file) => {
                let key = `${Date.now()}_${file.originalname}`;
                const mimeType = file.mimetype;
                if (!mimeType.includes("pdf") && !mimeType.includes("image")) {
                    return res.status(400).json({
                        error: "Invalid file type. Only PDF and image files are allowed.",
                    });
                }
                else {
                    key = key.replace(/[^a-zA-Z0-9.]/g, "_");
                    let preFile = {
                        originalname: file.originalname,
                        size: (0, fileFormat_util_1.formatFileSize)(file.size),
                        mimetype: mimeType,
                        url: `https://${process.env.R2_ENDPOINT_DOMAIN}/${bucket}/${key}`,
                        workspaceId: workspace_id,
                    };
                    files.push(preFile);
                }
                return (0, Cloudflare_services_1.uploadFile)(workspace_id, bucket, key, file.buffer, mimeType);
            });
            const urls = yield Promise.all(uploadPromises);
            files.forEach((file, index) => {
                if (file.mimetype.includes("pdf")) {
                    PDFFile_1.default.create({
                        fileName: file.originalname,
                        size: file.size,
                        workspaceId: file.workspaceId,
                        userId: user.id,
                        filePath: file.url,
                    });
                }
                else if (file.mimetype.includes("image")) {
                    ImageFile_1.default.create({
                        fileName: file.originalname,
                        size: file.size,
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
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Server error." });
        }
    }),
    generateQuiz: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { workspace_id, size } = req.body;
        if (!workspace_id || !size) {
            return res.status(400).json({ error: "Bad request." });
        }
        try {
            const pdfFiles = yield PDFFile_1.default.findAll({
                where: { workspaceId: workspace_id },
                attributes: ["filePath"],
            });
            const imageFiles = yield ImageFile_1.default.findAll({
                where: { workspaceId: workspace_id },
                attributes: ["filePath"],
            });
            const prompt = `Generate a quiz with ${size} questions and answers on the provided documenst alongside the images provided. Go through all documents and images extensively to make sure you set questions from everywhere if possible.`;
            const parts = [];
            parts.push({ text: prompt });
            // Add PDFs
            for (const file of pdfFiles) {
                const pdfResp = yield axios_1.default.get(file.filePath, {
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
                const imageResp = yield axios_1.default.get(file.filePath, {
                    responseType: "arraybuffer",
                });
                parts.push({
                    inlineData: {
                        mimeType: "image/jpeg",
                        data: Buffer.from(imageResp.data).toString("base64"),
                    },
                });
            }
            const response = yield ai.models.generateContent({
                model: process.env.THINKING_MODEL,
                contents: [
                    {
                        role: "user",
                        parts: parts,
                    },
                ],
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: genai_1.Type.ARRAY,
                        description: "List of quiz questions with options and correct answers.",
                        items: {
                            type: genai_1.Type.OBJECT,
                            properties: {
                                question: {
                                    type: genai_1.Type.STRING,
                                    description: "The quiz question.",
                                    nullable: false,
                                },
                                options: {
                                    type: genai_1.Type.ARRAY,
                                    description: "Multiple choice answer options.",
                                    items: {
                                        type: genai_1.Type.STRING,
                                    },
                                    nullable: false,
                                },
                                correct_answer: {
                                    type: genai_1.Type.STRING,
                                    description: "The correct answer from the options.",
                                    nullable: false,
                                },
                                explanation: {
                                    type: genai_1.Type.STRING,
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
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Server error." });
        }
    }),
    generateFlashcards: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { workspace_id, size } = req.body;
        if (!workspace_id || !size) {
            return res.status(400).json({ error: "Bad request." });
        }
        try {
            const pdfFiles = yield PDFFile_1.default.findAll({
                where: { workspaceId: workspace_id },
                attributes: ["filePath"],
            });
            const imageFiles = yield ImageFile_1.default.findAll({
                where: { workspaceId: workspace_id },
                attributes: ["filePath"],
            });
            const prompt = `Generate a ${size} of flashcard based on the provided documenst alongside the images provided. Go through all documents and images extensively to make sure you set questions from everywhere if possible.`;
            const parts = [];
            parts.push({ text: prompt });
            // Add PDFs
            for (const file of pdfFiles) {
                const pdfResp = yield axios_1.default.get(file.filePath, {
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
                const imageResp = yield axios_1.default.get(file.filePath, {
                    responseType: "arraybuffer",
                });
                parts.push({
                    inlineData: {
                        mimeType: "image/jpeg",
                        data: Buffer.from(imageResp.data).toString("base64"),
                    },
                });
            }
            const response = yield ai.models.generateContent({
                model: process.env.THINKING_MODEL,
                contents: [
                    {
                        role: "user",
                        parts: parts,
                    },
                ],
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: genai_1.Type.ARRAY,
                        description: "List of flashcards with questions and answers.",
                        items: {
                            type: genai_1.Type.OBJECT,
                            properties: {
                                question: {
                                    type: genai_1.Type.STRING,
                                    description: "The question or prompt on one side of the flashcard.",
                                    nullable: false,
                                },
                                answer: {
                                    type: genai_1.Type.STRING,
                                    description: "The answer or explanation on the other side of the flashcard.",
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
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Server error." });
        }
    }),
    getWorkspace: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: "Unauthorized access." });
        }
        try {
            if (!id) {
                const workspaces = yield Workspace_1.default.findAll({
                    where: { userId: user.id },
                    attributes: { exclude: ['id', 'createdAt', 'updatedAt'] }
                });
                return res.status(200).json({
                    success: true,
                    message: "Workspaces retrieved successfully.",
                    workspaces,
                });
            }
            else {
                let workspace = yield Workspace_1.default.findOne({
                    where: { enc_id: id, userId: user.id },
                    attributes: { exclude: ['id', 'createdAt', 'updatedAt'] }
                });
                if (!workspace) {
                    return res.status(404).json({ error: "Workspace not found." });
                }
                const imageFiles = yield ImageFile_1.default.findAll({
                    where: { workspaceId: workspace === null || workspace === void 0 ? void 0 : workspace.dataValues.enc_id },
                    attributes: ["filePath", "fileName"],
                });
                const pdfFiles = yield PDFFile_1.default.findAll({
                    where: { workspaceId: workspace === null || workspace === void 0 ? void 0 : workspace.dataValues.enc_id },
                    attributes: ["filePath", "fileName", "size"],
                });
                if (!workspace) {
                    return res.status(404).json({ error: "Workspace not found." });
                }
                const files = [
                    { imageFiles },
                    { pdfFiles },
                ];
                workspace = Object.assign(Object.assign({}, workspace.get({ plain: true })), { files });
                return res.status(200).json({
                    success: true,
                    message: "Workspace retrieved successfully.",
                    workspace,
                });
            }
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Server error." });
        }
    }),
    getYoutubeVideo: (req, res) => __awaiter(void 0, void 0, void 0, function* () {
        const { id } = req.params;
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: "Unauthorized access." });
        }
        try {
            if (!id) {
                return res.status(400).json({ error: "Bad request." });
            }
            const url = `https://www.googleapis.com/youtube/v3/videos?id=${id}&key=${process.env.YOUTUBE_API_KEY}&part=snippet,contentDetails,statistics`;
            const response = yield axios_1.default.get(url);
            const videoData = response.data.items[0];
            if (!videoData) {
                return res.status(404).json({ error: "Video not found." });
            }
            return res.status(200).json({
                success: true,
                message: "Video retrieved successfully.",
                videoData,
            });
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Server error." });
        }
    }),
};
exports.default = userActions;
