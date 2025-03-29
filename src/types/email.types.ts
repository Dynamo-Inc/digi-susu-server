import { TemplateExecutor } from 'lodash';

export type EmailTemplate = {
  subject: TemplateExecutor | any;
  text: TemplateExecutor | any;
  html: TemplateExecutor | any;
};

export type TEmailTemplates = {
  [key: string]: EmailTemplate;
};

export type EmailTemplates = {
  UserSignUp: EmailTemplate;
};

export type EmailTemplateKeys = keyof EmailTemplates;

export type SendEmailTemplateProps = {
  templateKey: EmailTemplateKeys;
  data: any;
};
