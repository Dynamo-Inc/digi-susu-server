import Container, { Service } from 'typedi';
import AWS from 'aws-sdk';
import { MAIL_FROM, AWS_ACCESS_KEY_ID, AWS_SECRET_KEY_ID } from '../config';
import { logger } from '../utils/logger';
import { NotificationService } from './notification.service';

@Service()
export default class EmailService {
  private static instance: EmailService;
  private notification = Container.get(NotificationService);
  private ses: AWS.SES;

  constructor() {
    this.ses = new AWS.SES({
      region: 'us-north-1',
      accessKeyId: AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_SECRET_KEY_ID,
    });
  }

  static getInstance() {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  public async sendEmail(to: string, subject: string, html: string): Promise<void> {
    const params: AWS.SES.SendEmailRequest = {
      Source: MAIL_FROM,
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Data: subject },
        Body: { Html: { Data: html } },
      },
    };

    try {
      await this.ses.sendEmail(params).promise();
      logger.info(`Email sent to ${to}`);
    } catch (error) {
      logger.error(`Error sending email to ${to}`, error);
    }
  }
}
