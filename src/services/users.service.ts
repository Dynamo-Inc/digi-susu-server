import Container, { Service } from 'typedi';
import { HttpException } from '../utils/httpException';
import httpStatus from 'http-status';
import { User } from '../models';
import EmailService from './email.service';
import { UserSessionService } from './userSession.service';
@Service()
export class UserService {
  private email = Container.get(EmailService);
  private userSession = Container.get(UserSessionService);

  public async findUserById(userId: string): Promise<User> {
    const findUser: any = await User.findByPk(userId);
    if (!findUser) throw new HttpException(httpStatus.NOT_FOUND, 'User not found');
    return findUser;
  }

  public async updateUser(userId: string, data: any): Promise<boolean> {
    const findUser: any = await User.findByPk(userId);
    if (!findUser) throw new HttpException(httpStatus.NOT_FOUND, 'User not found');

    await findUser.update(data);

    await findUser.save();
    return true;
  }
}
