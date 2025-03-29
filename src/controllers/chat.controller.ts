import { Container } from 'typedi';
import AiChatService from '../services/openai.service';
import { Response } from 'express';
import httpStatus from 'http-status';
import catchAsync from '../utils/catchAsync';
import { RequestWithUser } from '../interfaces/auth.interface';
import { SendChatDto } from '../dtos/chat.dto';

export class ChatController {
  public openai = Container.get(AiChatService);

  public sendPrompt = catchAsync(async (req: RequestWithUser, res: Response) => {
    const userData: SendChatDto = req.body;

    const chatResponse = await this.openai.getSusuInsight(userData?.message);
    res.status(httpStatus.CREATED).send(chatResponse);
  });
}
