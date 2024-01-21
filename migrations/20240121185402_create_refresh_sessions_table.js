/**
 * @param {import('knex')} knex
 */
export async function up(knex) {
  return knex.raw(`
    CREATE TABLE IF NOT EXISTS refresh_sessions (
      id SERIAL PRIMARY KEY,
      "userId" INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      refresh_token VARCHAR(400) NOT NULL,
      finger_print VARCHAR(400) NOT NULL
    );
  `);
}

/**
 * @param {import('knex')} knex
 */
export async function down(knex) {
  return knex.raw('DROP TABLE IF EXISTS refresh_sessions;');
}
