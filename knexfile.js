import dotenv from 'dotenv';
dotenv.config();

export const development = {
  client: 'pg',
  connection: {
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    user: process.env.DATABASE_USER,
    database: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD,
    ssl: process.env.DATABASE_SSL ? { rejectUnauthorized: false } : false,
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: './migrations',
  },
};
