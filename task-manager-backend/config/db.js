const mysql = require("mysql2/promise");
const dotenv = require("dotenv");

dotenv.config();

const initDb = async () => {
    const db = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL
    )
  `);

    await db.execute(`
    CREATE TABLE IF NOT EXISTS tasks (
      id VARCHAR(255) PRIMARY KEY,
      text VARCHAR(255) NOT NULL,
      completed BOOLEAN DEFAULT FALSE,
      user VARCHAR(255) NOT NULL,
      due_date DATE
    )
  `);

    await db.end();
};

module.exports = initDb;