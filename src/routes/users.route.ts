import { UserController } from '../controllers/users.controller';
import { Router } from 'express';
import { Routes } from '../interfaces/routes.interface';

export class UserRoute implements Routes {
  public router = Router();
  public user = new UserController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // this.router.get('/users', this.user.getUsers);
    // this.router.get('/users/:id', this.user.getUserById);
    // this.router.post(
    //   '/users',
    //   ValidationMiddleware(UserController.createUserValidation),
    //   this.user.createUser,
    // );
    // this.router.put(
    //   '/users/:id',
    //   ValidationMiddleware(UserController.updateUserValidation),
    //   this.user.updateUser,
    // );
    // this.router.delete('/users/:id', this.user.deleteUser);
  }
}
