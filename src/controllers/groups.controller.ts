import { Container } from 'typedi';
import { Request, Response } from 'express';
import { GroupService } from '../services/group.service';
import catchAsync from '../utils/catchAsync';
import httpStatus from 'http-status';
import { RequestWithUser } from '../interfaces/auth.interface';
import { GetMyGroupsDto } from '../dtos/susu-group.dto';

export class GroupsController {
  public group = Container.get(GroupService);

  public getMyGroups = catchAsync(async (req: RequestWithUser, res: Response) => {
    const userData: GetMyGroupsDto = req.body;
    const { pagination } = userData;

    const groupsData = await this.group.getMyGroups(req.user.id, pagination);
    res.status(httpStatus.CREATED).send(groupsData);
  });

  public getGroupByCode = catchAsync(async (req: Request, res: Response) => {
    const groupData = await this.group.getGroupByCode(req.params.code);
    res.status(httpStatus.OK).send(groupData);
  });

  public getAllPublicGroups = catchAsync(async (req: Request, res: Response) => {
    const userData: GetMyGroupsDto = req.body;
    const { pagination } = userData;
    const groupData = await this.group.getAllPublicGroups(pagination);
    res.status(httpStatus.OK).send(groupData);
  });
}
