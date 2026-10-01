const pool = require("../db/pool");

async function findAllMessages() {
  const { rows } = await pool.query(
        `SELECT messages.id, messages.title, messages.text, messages.created_at,
          COALESCE(messages.author_first_name, users.first_name, 'Former') AS first_name,
          COALESCE(messages.author_last_name, users.last_name, 'Member') AS last_name
     FROM messages
         LEFT JOIN users ON users.id = messages.user_id
     ORDER BY messages.created_at DESC, messages.id DESC`
  );
  return rows;
}

async function findMessageById(messageId) {
  const { rows } = await pool.query(
        `SELECT messages.id, messages.title, messages.text, messages.created_at,
          COALESCE(messages.author_first_name, users.first_name, 'Former') AS first_name,
          COALESCE(messages.author_last_name, users.last_name, 'Member') AS last_name
     FROM messages
         LEFT JOIN users ON users.id = messages.user_id
     WHERE messages.id = $1`,
    [messageId]
  );
  return rows[0];
}

async function createMessage(userId, title, text) {
  const { rows } = await pool.query(
    `INSERT INTO messages (user_id, title, text, author_first_name, author_last_name)
     SELECT id, $2, $3, first_name, last_name
     FROM users
     WHERE id = $1
     RETURNING id, title, text, created_at, user_id, author_first_name, author_last_name`,
    [userId, title, text]
  );
  return rows[0];
}

async function deleteMessage(messageId) {
  const { rowCount } = await pool.query(
    "DELETE FROM messages WHERE id = $1",
    [messageId]
  );
  return rowCount > 0;
}

module.exports = { findAllMessages, findMessageById, createMessage, deleteMessage };