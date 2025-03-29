import { Service } from 'typedi';
import { logger } from '../utils/logger';
import fs from 'fs';
import path from 'path';
import _ from 'lodash';
import { EmailTemplateKeys, SendEmailTemplateProps, EmailTemplates } from '../types/email.types';

@Service()
export class NotificationService {
  private EMAIL_TEMPLATES: EmailTemplates = {
    UserSignUp: {
      subject: _.template('Email Verification Code'),
      text: _.template(this.htmlToPlainText(this.loadTemplateFile('UserSignUp'))),
      html: _.template(this.loadTemplateFile('UserSignUp')),
    },
  };

  public loadTemplateFile(fileName: EmailTemplateKeys): string {
    const filePath = path.join(__dirname, '../templates/email', `${_.toString(fileName)}.html`);
    try {
      return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
      console.error(`Error loading template file: ${filePath}`, error);
      throw new Error('Template file could not be loaded');
    }
  }

  public htmlToPlainText(html: string): string {
    return (
      html
        .replace(/<!DOCTYPE html>/i, '')
        // .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
        .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
        .replace(/<\/?[a-z][\s\S]*?>/gi, '')
        .replace(/\s+/g, ' ')
        .trim()
    );
  }

  public getEmailTemplate({ templateKey, data }: SendEmailTemplateProps) {
    const template = _.toString(templateKey);
    try {
      const _subject = this.EMAIL_TEMPLATES[template].subject(data);
      const _text = this.EMAIL_TEMPLATES[template].text(data);
      const _html = this.EMAIL_TEMPLATES[template].html(data);

      return { subject: _subject, text: _text, html: _html };
    } catch (e) {
      logger.error(`Error loading email template: ${template}`, e);
    }
  }
}
