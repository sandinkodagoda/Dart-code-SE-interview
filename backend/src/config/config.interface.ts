export interface AppConfig {
  nodeEnv: string;
  port: number;
  apiPrefix: string;
  appName: string;
  frontendUrl: string;
}

export interface DatabaseConfig {
  url: string;
}

export interface JwtConfig {
  secret: string;
  expiresIn: string;
}

export interface UploadsConfig {
  uploadDir: string;
  maxFileSize: number;
}

export interface PayHereConfig {
  merchantId: string;
  merchantSecret: string;
  currency: string;
  baseUrl: string;
}

export interface WhatsAppConfig {
  businessNumber: string;
}

export interface Configuration {
  app: AppConfig;
  database: DatabaseConfig;
  jwt: JwtConfig;
  uploads: UploadsConfig;
  payhere: PayHereConfig;
  whatsapp: WhatsAppConfig;
}
