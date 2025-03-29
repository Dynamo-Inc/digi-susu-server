import Stripe from 'stripe';
import { STRIPE_SECRET_KEY } from '.';

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2025-02-24.acacia',
  typescript: true,
  appInfo: {
    name: 'Susu-Health-Services',
    version: '1.0.0',
  },
});

export default stripe;
