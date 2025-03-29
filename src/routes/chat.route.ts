import { Router } from 'express';
import { Routes } from '../interfaces/routes.interface';
import { ChatController } from '../controllers/chat.controller';
import { UserAuthMiddleware } from '../middlewares/userAuth.middleware';
import { SendChatDto } from '../dtos/chat.dto';
import { ValidationMiddleware } from '../middlewares/validation.middleware';

export class ChatRoute implements Routes {
  public router = Router();
  public chat = new ChatController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post('/chat/send-prompt', UserAuthMiddleware(), ValidationMiddleware(SendChatDto), this.chat.sendPrompt);
  }
}
