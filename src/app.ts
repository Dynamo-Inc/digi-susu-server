import 'reflect-metadata';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import hpp from 'hpp';
import morgan from 'morgan';
import { NODE_ENV, PORT, LOG_FORMAT, ORIGIN, CREDENTIALS } from './config';
import { createServer, Server } from 'http';
import { Server as SocketServer } from 'socket.io';

import { Routes } from './interfaces/routes.interface';
import { ErrorMiddleware } from './middlewares/error.middleware';
import { logger, stream } from './utils/logger';
import { userJwtStrategy, userPassport } from './config/passport';
import { initSocket } from './config/socket.config';
import { UserSocketHandler } from './socket/user.socket';
import { initDb, sequelize } from './models';

export class App {
  public app: express.Application;
  public env: string;
  public port: string | number;
  public httpServer: Server;
  public io: SocketServer;
  public db: void;

  constructor(routes: Routes[]) {
    this.handleProcessErrors();
    this.app = express();
    this.env = NODE_ENV || 'development';
    this.port = PORT || 4000;
    this.db = initDb(sequelize);

    this.httpServer = createServer(this.app);

    this.io = initSocket(this.httpServer);

    this.app.set('socketio', this.io);

    this.app.disable('x-powered-by');

    this.app.set('trust proxy', 1 /* number of proxies between user and server */);

    this.initializeMiddlewares();
    this.initializeSockets();
    this.initializeRoutes(routes);
    this.initializeErrorHandling();
  }

  public listen() {
    this.app.listen(this.port, () => {
      logger.info(`=================================`);
      logger.info(`======= ENV: ${this.env} =======`);
      logger.info(`🚀 App listening on the port ${this.port}`);
      logger.info(`=================================`);
    });
  }

  public getServer() {
    return this.app;
  }

  private initializeMiddlewares() {
    this.app.use(morgan(LOG_FORMAT, { stream }));
    this.app.use(cors({ origin: ORIGIN, credentials: CREDENTIALS }));
    this.app.use(hpp());
    this.app.use(helmet());
    this.app.use(compression());
    this.app.use(
      express.json({
        verify(req, res, buf) {
          (req as any).rawBody = buf;
        },
      }),
    );
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(cookieParser());

    this.app.use(
      userPassport.initialize({
        userProperty: 'user',
        assignProperty: 'user',
        key: 'user',
      }),
    );
    userPassport.use('user', userJwtStrategy);
  }

  private initializeRoutes(routes: Routes[]) {
    this.app.use('/health', (_, res) => {
      res.status(200).json({ message: 'All is green 🚀' });
    });
    routes.forEach(route => {
      this.app.use('/', route.router);
    });
  }

  private initializeSockets() {
    this.io.on('connection', socket => {
      console.log('Socket connected', socket.id);

      console.log('Socket connected', socket.id);

      new UserSocketHandler(this.io, socket);
      socket.onAny((event, ...args) => {
        logger.info(`IO:: Event: ${event}, Args: ${JSON.stringify(args)}`);
      });
    });

    this.io.on('disconnect', socket => {
      console.log('Socket disconnected', socket.id);
    });

    this.io.on('error', error => {
      console.log('Socket error', error);
    });
  }

  private initializeErrorHandling() {
    this.app.use(ErrorMiddleware);
  }

  private handleProcessErrors() {
    process.on('unhandledRejection', (reason, promise) => {
      console.error('Unhandled Rejection at:', promise, 'reason:', reason);
      logger.error(`Unhandled Rejection: ${reason}`);
      process.exit(1);
    });

    process.on('uncaughtException', err => {
      console.error('Uncaught Exception:', err);
      logger.error(`Uncaught Exception: ${err.message}`);
      process.exit(1);
    });
  }
}
