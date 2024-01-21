/**
 * @param {import('knex')} knex
 */
export async function up(knex) {
  return knex.raw(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      password VARCHAR(255) NOT NULL,
      "deviceId" VARCHAR(255),
      "favoriteAssets" JSON[],
      "notificationTime" INTEGER
    );
  `);
}

/**
 * @param {import('knex')} knex
 */
export async function down(knex) {
  return knex.raw('DROP TABLE IF EXISTS users;');
}

