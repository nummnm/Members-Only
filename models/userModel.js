const pool = require("../db/pool");

async function createUser(firstName, lastName, username, password) {
  const { rows } = await pool.query(
    `INSERT INTO users (first_name, last_name, username, password)
     VALUES ($1, $2, $3, $4)
    RETURNING id, first_name, last_name, username, membership_status, is_admin, profile_icon`,
    [firstName, lastName, username, password]
  );
  return rows[0];
}

async function findUserByUsername(username) {
  const { rows } = await pool.query(
    `SELECT id, first_name, last_name, username, password, membership_status, is_admin, profile_icon
     FROM users WHERE username = $1`,
    [username]
  );
  return rows[0];
}

async function findUserById(id) {
  const { rows } = await pool.query(
    `SELECT id, first_name, last_name, username, membership_status, is_admin, profile_icon
     FROM users WHERE id = $1`,
    [id]
  );
  return rows[0];
}

async function makeMember(userId) {
  const { rows } = await pool.query(
    `UPDATE users SET membership_status = TRUE WHERE id = $1
    RETURNING id, first_name, last_name, username, membership_status, is_admin, profile_icon`,
    [userId]
  );
  return rows[0];
}

async function makeAdmin(userId) {
  const { rows } = await pool.query(
    `UPDATE users SET is_admin = TRUE WHERE id = $1
     RETURNING id, first_name, last_name, username, membership_status, is_admin, profile_icon`,
    [userId]
  );
  return rows[0];
}

async function updateProfileIcon(userId, profileIcon) {
  const { rows } = await pool.query(
    `UPDATE users SET profile_icon = $2 WHERE id = $1
     RETURNING id, first_name, last_name, username, membership_status, is_admin, profile_icon`,
    [userId, profileIcon]
  );
  return rows[0];
}

async function leaveClub(userId) {
  const { rows } = await pool.query(
    `UPDATE users SET membership_status = FALSE WHERE id = $1
     RETURNING id, first_name, last_name, username, membership_status, is_admin, profile_icon`,
    [userId]
  );
  return rows[0];
}

async function removeAdminRole(userId) {
  const { rows } = await pool.query(
    `UPDATE users SET is_admin = FALSE WHERE id = $1
     RETURNING id, first_name, last_name, username, membership_status, is_admin, profile_icon`,
    [userId]
  );
  return rows[0];
}

async function deleteUser(userId) {
  const { rowCount } = await pool.query("DELETE FROM users WHERE id = $1", [userId]);
  return rowCount > 0;
}

module.exports = {
  createUser,
  findUserByUsername,
  findUserById,
  makeMember,
  makeAdmin,
  updateProfileIcon,
  leaveClub,
  removeAdminRole,
  deleteUser,
};
