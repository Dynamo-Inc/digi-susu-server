import { Container } from 'typedi';
import { UserService } from '../services/users.service';

export class UserController {
  public user = Container.get(UserService);
}
