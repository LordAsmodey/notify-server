/**
 * @param {import('knex')} knex
 */
export async function up(knex) {
  await knex.raw(`
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      currency VARCHAR(30) NOT NULL,
      price_min DECIMAL(18, 8) NOT NULL,
      price_max DECIMAL(18, 8) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await knex.raw(`
    CREATE TABLE IF NOT EXISTS sent_notifications (
      id SERIAL PRIMARY KEY,
      notification_id INT NOT NULL,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      currency VARCHAR(30) NOT NULL,
      price_min DECIMAL(18, 8) NOT NULL,
      price_max DECIMAL(18, 8) NOT NULL,
      sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

/**
 * @param {import('knex')} knex
 */
export async function down(knex) {
  await knex.raw('DROP TABLE IF EXISTS sent_notifications;');
  await knex.raw('DROP TABLE IF EXISTS notifications;');
}

