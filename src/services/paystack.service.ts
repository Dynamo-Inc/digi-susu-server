import axios, { AxiosInstance } from 'axios';
import { Service } from 'typedi';

interface CreateCustomerRequest {
  email: string;
  first_name: string;
}

@Service()
export class PaystackService {
  private paystack: AxiosInstance;

  constructor() {
    this.paystack = axios.create({
      baseURL: 'https://api.paystack.co',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Create a customer in Paystack.
   */
  public async createCustomer(data: CreateCustomerRequest) {
    try {
      const response = await this.paystack.post('/customer', data);
      console.log(response.data.data);
      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }
}
