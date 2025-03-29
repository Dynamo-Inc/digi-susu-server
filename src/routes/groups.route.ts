import { GroupsController } from '../controllers/groups.controller';
import { Router } from 'express';
import { Routes } from '../interfaces/routes.interface';
import { UserAuthMiddleware } from '../middlewares/userAuth.middleware';

export class GroupRoute implements Routes {
  public router = Router();
  public group = new GroupsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get('/groups', UserAuthMiddleware(), this.group.getMyGroups);
    this.router.get('/groups/:code', UserAuthMiddleware(), this.group.getGroupByCode);
    this.router.get('/groups/public', UserAuthMiddleware(), this.group.getAllPublicGroups);
  }
}
