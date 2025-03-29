import Queue from 'bull';
import { REDIS_PASSWORD, REDIS_PORT, REDIS_URL } from '.';

function bullQ<T = any>(name: string) {
  return new Queue<T>(name, {
    redis: {
      host: REDIS_URL,
      port: parseInt(REDIS_PORT),
      password: REDIS_PASSWORD,
    },
    defaultJobOptions: {
      removeOnComplete: true,
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 1000,
      },
    },
  });
}

export default bullQ;
