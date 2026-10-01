const pool = require("./pool");

function quoteIdentifier(identifier) {
  return `"${identifier.replaceAll('"', '""')}"`;
}

async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      first_name VARCHAR(80) NOT NULL,
      last_name VARCHAR(80) NOT NULL,
      username VARCHAR(254) NOT NULL UNIQUE,
      password VARCHAR(100) NOT NULL,
      membership_status BOOLEAN NOT NULL DEFAULT FALSE,
      is_admin BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const { rows: userColumns } = await pool.query(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_schema = current_schema() AND table_name = $1`,
    ["users"]
  );
  if (!userColumns.some(({ column_name }) => column_name === "profile_icon")) {
    await pool.query("ALTER TABLE users ADD COLUMN profile_icon VARCHAR(255)");
  }

  await pool.query(`
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
      title VARCHAR(120) NOT NULL,
      text TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
      author_first_name VARCHAR(80) NOT NULL,
      author_last_name VARCHAR(80) NOT NULL
    )
  `);

  const { rows: messageColumns } = await pool.query(
    `SELECT column_name
     FROM information_schema.columns
     WHERE table_schema = current_schema() AND table_name = $1`,
    ["messages"]
  );
  const columnNames = new Set(messageColumns.map(({ column_name }) => column_name));

  if (columnNames.has("timestamp") && !columnNames.has("created_at")) {
    await pool.query('ALTER TABLE messages RENAME COLUMN "timestamp" TO created_at');
  } else if (!columnNames.has("created_at")) {
    await pool.query(`
      ALTER TABLE messages
      ADD COLUMN created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
    `);
  }

  if (!columnNames.has("author_first_name")) {
    await pool.query("ALTER TABLE messages ADD COLUMN author_first_name VARCHAR(80)");
  }
  if (!columnNames.has("author_last_name")) {
    await pool.query("ALTER TABLE messages ADD COLUMN author_last_name VARCHAR(80)");
  }

  await pool.query(`
    UPDATE messages
    SET author_first_name = COALESCE(messages.author_first_name, users.first_name),
        author_last_name = COALESCE(messages.author_last_name, users.last_name)
    FROM users
    WHERE users.id = messages.user_id
      AND (messages.author_first_name IS NULL OR messages.author_last_name IS NULL)
  `);
  await pool.query(`
    UPDATE messages
    SET author_first_name = COALESCE(author_first_name, 'Former'),
        author_last_name = COALESCE(author_last_name, 'Member')
    WHERE author_first_name IS NULL OR author_last_name IS NULL
  `);
  await pool.query(`
    ALTER TABLE messages
      ALTER COLUMN author_first_name SET NOT NULL,
      ALTER COLUMN author_last_name SET NOT NULL,
      ALTER COLUMN user_id DROP NOT NULL
  `);

  const { rows: userForeignKeys } = await pool.query(`
    SELECT DISTINCT constraints.conname
    FROM pg_constraint AS constraints
    JOIN pg_attribute AS columns
      ON columns.attrelid = constraints.conrelid
      AND columns.attnum = ANY(constraints.conkey)
    WHERE constraints.conrelid = 'messages'::regclass
      AND constraints.contype = 'f'
      AND columns.attname = 'user_id'
  `);
  for (const { conname } of userForeignKeys) {
    await pool.query(`ALTER TABLE messages DROP CONSTRAINT ${quoteIdentifier(conname)}`);
  }
  await pool.query(`
    ALTER TABLE messages
    ADD CONSTRAINT messages_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
  `);

  await pool.query(`
    CREATE INDEX IF NOT EXISTS messages_created_at_idx
    ON messages (created_at DESC, id DESC)
  `);
}

module.exports = initializeDatabase;