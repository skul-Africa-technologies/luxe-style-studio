export interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    status: string;
    reference: string;
    metadata: {
      orderId: string;
    };
  };
}
