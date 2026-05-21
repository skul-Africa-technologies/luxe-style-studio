import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { PaystackVerifyResponse } from '../types/paystack-response';

@Injectable()
export class PaymentsService {
  private baseUrl = process.env.PAYSTACK_BASE_URL;
  private secretKey = process.env.PAYSTACK_SECRET_KEY;

  async initializePayment(email: string, amount: number, orderId: string): Promise<any> {
    return axios.post(
      `${this.baseUrl}/transaction/initialize`,
      {
        email,
        amount: amount * 100,
        metadata: { orderId },
        callback_url: `${process.env.FRONTEND_URL}/payment/callback`,
      },
      {
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
          'Content-Type': 'application/json',
        },
      },
    );
  }

  async verifyPayment(reference: string): Promise<any> {
    const response = await axios.get(
      `${this.baseUrl}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
        },
      },
    );

    return response.data;
  }
}
