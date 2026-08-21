import { registerAs } from '@nestjs/config';

export default registerAs('storage', () => ({
  bucket: process.env.R2_BUCKET,
  endpoint: process.env.R2_ENDPOINT,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  publicUrl: process.env.R2_PUBLIC_URL,
}));
