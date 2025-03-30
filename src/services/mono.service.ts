import axios, { AxiosInstance } from 'axios';
import Container, { Service } from 'typedi';
import { MONO_SECRET_KEY } from '../config';
import { UserService } from './users.service';

interface CreateCustomerRequest {
  userId: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  address: string;
  identity: {
    type: string;
    number: string;
  };
}

@Service()
export class MonoService {
  private mono: AxiosInstance;
  private userService = Container.get(UserService);

  constructor() {
    this.mono = axios.create({
      baseURL: 'https://api.withmono.com/v2',
      headers: {
        accept: 'application/json',
        'content-type': 'application/json',
        'mono-sec-key': MONO_SECRET_KEY,
      },
    });
  }

  /**
   * Create a customer in Mono.
   */
  public async createCustomer(data: CreateCustomerRequest) {
    try {
      const { userId, ...customerData } = data;
      const response = await this.mono.post('/customers', customerData);
      console.log(response.data.data);

      await this.userService.updateUser(userId, {
        monoCustomerId: response?.data?.data?.id,
      });

      return response.data;
    } catch (error) {
      throw error.response.data;
    }
  }
}
