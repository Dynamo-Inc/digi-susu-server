import axios, { AxiosInstance } from 'axios';
import { Service } from 'typedi';

interface sendThirdWebRequest {
  message: string;
  to: string;
}

@Service()
export class ThirdWebService {
  private thirdweb: AxiosInstance;

  constructor() {
    this.thirdweb = axios.create({
      baseURL: 'https://api.wittyflow.com/v1',
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  public async savePayIn(data: sendThirdWebRequest) {
    try {
      const response = await this.thirdweb.post('/payin', data);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }
}
