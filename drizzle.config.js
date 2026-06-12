import 'dotenv/config';
export default {
  schema: './cli-proxy-server/db/schema.js',
  out: './cli-proxy-server/db/migrations',
  dialect: 'postgresql',
  dbCredentials: { url: process.env.DATABASE_URL },
};
