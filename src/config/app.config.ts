import { registerAs } from '@nestjs/config';

// Cette configuration centralise les options globales de demarrage de l'application.
export default registerAs('app', () => ({
  port: parseInt(process.env.PORT ?? '3000', 10),
  apiPrefix: 'api',
}));