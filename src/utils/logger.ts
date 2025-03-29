import winston from 'winston';
import { S3StreamLogger } from 's3-streamlogger';
import { join } from 'path';
import winstonDaily from 'winston-daily-rotate-file';
import { AWS_ACCESS_KEY_ID, AWS_BUCKET, AWS_REGION, AWS_SECRET_KEY_ID } from '../config';

// S3 Logger Stream
const s3Stream = new S3StreamLogger({
  bucket: AWS_BUCKET,
  config: {
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_KEY_ID,
    },
    region: AWS_REGION,
  },
  region: AWS_REGION,
  folder: 'logs',
  rotate_every: 1,
  name_format: `susu-server-%Y-%m-%d.log`,
});

const logDir: string = join(__dirname, '../../logs');

const fileFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.uncolorize(),
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  winston.format.prettyPrint({
    depth: 5,
  }),
  winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`),
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
  }),
  winston.format.prettyPrint({
    depth: 5,
  }),
  winston.format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`),
);

const logger = winston.createLogger({
  level: 'info',
  defaultMeta: { service: 'susu-backend' },
  transports: [
    new winstonDaily({
      level: 'debug',
      datePattern: 'YYYY-MM-DD',
      dirname: logDir + '/debug',
      filename: `%DATE%.log`,
      maxFiles: 30,
      json: false,
      zippedArchive: true,
    }),

    new winstonDaily({
      level: 'error',
      datePattern: 'YYYY-MM-DD',
      dirname: logDir + '/error',
      filename: `%DATE%.log`,
      maxFiles: 30,
      handleExceptions: true,
      json: false,
      zippedArchive: true,
    }),

    new winston.transports.Stream({
      stream: s3Stream,
      format: fileFormat,
    }),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    }),
  );
}

const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

export { logger, stream };
