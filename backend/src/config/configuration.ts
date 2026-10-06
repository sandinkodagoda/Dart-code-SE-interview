import { Configuration } from './config.interface';

export const configuration = (): Configuration => ({
  app: {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),
    apiPrefix: process.env.API_PREFIX || 'api/v1',
    appName: process.env.APP_NAME || 'Nexora API',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  },
  database: {
    url:
      process.env.DATABASE_URL ||
      'postgresql://postgres:postgres@localhost:5432/electronics_ecommerce?schema=public',
  },
  jwt: {
    secret:
      process.env.JWT_SECRET ||
      'super-secret-jwt-key-replace-in-production-min-32-chars',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
  uploads: {
    uploadDir: process.env.UPLOAD_DIR || './uploads',
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880', 10), // 5MB
  },
  payhere: {
    merchantId: process.env.PAYHERE_MERCHANT_ID || '',
    merchantSecret: process.env.PAYHERE_MERCHANT_SECRET || '',
    currency: process.env.PAYHERE_CURRENCY || 'LKR',
    baseUrl:
      process.env.PAYHERE_BASE_URL ||
      'https://sandbox.payhere.lk/pay/checkout',
  },
  whatsapp: {
    businessNumber: process.env.WHATSAPP_BUSINESS_NUMBER || '94711093799',
  },
});
