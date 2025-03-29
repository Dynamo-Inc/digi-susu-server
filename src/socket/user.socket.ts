import { Server, Socket } from 'socket.io';
import Container from 'typedi';
import { logger } from '../utils/logger';
import { UserService } from '../services/users.service';

export class UserSocketHandler {
  public io: Server;
  public socket: Socket;
  public user: any;
  public _userService = Container.get(UserService);

  constructor(io: Server, socket: Socket) {
    this.io = io;
    this.socket = socket;
    this.user = (socket.request as any)?.user;
    this.connected();
    this.initialize();
  }

  public initialize() {
    this.socket.on('connection', this.connected);
    this.socket.on('disconnect', this.disconnected);
  }

  private connected = async () => {
    try {
      this.socket.join(this.user.id.toString());
      logger.info(`Socket connected ${this.socket.id}`);
    } catch (e) {
      logger.error(e);
    }
  };

  private disconnected = () => {
    logger.info(`Socket disconnected ${this.socket.id}`);
  };
}
