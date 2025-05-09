import { Request, Response } from "express";

type UserActionFn = (
    req: Request & afterVerificationMiddlerwareInterface,
    res: Response
  ) => Promise<Response | void>;


export interface prefileInterface {
    originalname: string;
    size: string;
    mimetype: string;
    url: string;   
    workspaceId: string;
}

export interface userActionsInterface {
  createWorkspace: UserActionFn;
  askQuestion: UserActionFn;
  generateMaterial: UserActionFn;
  addFiles: UserActionFn;
  generateQuiz: UserActionFn;
  generateFlashcards: UserActionFn;
  getWorkspace: UserActionFn;
  getYoutubeVideo: UserActionFn;
}

export interface afterVerificationMiddlerwareInterface {
  user: {
    id: number;
    name: string;
    email: string;
  };
}
