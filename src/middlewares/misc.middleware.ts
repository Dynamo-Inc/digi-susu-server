import { Response, NextFunction } from 'express';
import { Stream } from 'stream';

export interface RequestWithRawBody extends Request {
  rawBody: Buffer;
}

export const addRawBody = () => (req: Stream, _: Response, next: NextFunction) => {
  const chunks: Buffer[] = [];

  req.on('data', (chunk: Buffer) => {
    chunks.push(chunk);
  });

  req.on('end', () => {
    (req as unknown as RequestWithRawBody).rawBody = Buffer.concat(chunks);
    next();
  });
};
