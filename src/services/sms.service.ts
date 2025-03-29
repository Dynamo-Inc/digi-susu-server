import axios, { AxiosInstance } from 'axios';
import { Service } from 'typedi';
import { SMS_APP_ID, SMS_APP_SECRET } from '../config';

interface sendSmsRequest {
  message: string;
  to: string;
}

@Service()
export class SMSService {
  private wittyflow: AxiosInstance;

  constructor() {
    this.wittyflow = axios.create({
      baseURL: 'https://api.wittyflow.com/v1',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  public async sendSMS(data: sendSmsRequest) {
    try {
      const body = {
        from: 'FinaBank',
        to: data.to,
        type: '1', // Use 0 for flash SMS and 1 for plain SMS
        message: data.message,
        app_id: SMS_APP_ID,
        app_secret: SMS_APP_SECRET,
      };
      const response = await this.wittyflow.post('/messages/send', body);

      console.log('Status:', response.status);
      console.log('Headers:', response.headers);
      console.log('Body:', response.data);
    } catch (error) {
      throw error.response.data;
    }
  }

  public async sendVerificationCode(to: string, code: string) {
    const message = `Your verification code is ${code}. Please enter this code to verify your account.`;
    await this.sendSMS({ message, to });
  }
}
