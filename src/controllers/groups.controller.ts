import { Container } from 'typedi';
import { Request, Response } from 'express';
import { GroupService } from '../services/group.service';
import catchAsync from '../utils/catchAsync';
import httpStatus from 'http-status';
import { RequestWithUser } from '../interfaces/auth.interface';

export class GroupsController {
  public group = Container.get(GroupService);

  public getMyGroups = catchAsync(async (req: RequestWithUser, res: Response) => {
    const limit = parseInt(req.params.limit, 10);
    const skip = parseInt(req.params.skip, 10);

    const groupsData = await this.group.getMyGroups(req.user.id, { limit, skip });
    res.status(httpStatus.CREATED).send(groupsData);
  });

  public getGroupByCode = catchAsync(async (req: Request, res: Response) => {
    const groupData = await this.group.getGroupByCode(req.params.code);
    res.status(httpStatus.OK).send(groupData);
  });

  public getAllPublicGroups = catchAsync(async (req: Request, res: Response) => {
    const limit = parseInt(req.params.limit, 10);
    const skip = parseInt(req.params.skip, 10);
    const groupData = await this.group.getAllPublicGroups({ limit, skip });
    res.status(httpStatus.OK).send(groupData);
  });
}
