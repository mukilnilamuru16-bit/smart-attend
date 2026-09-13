const path = require('path');
const fs = require('fs');
require('dotenv').config();

const isPostgres = Boolean(process.env.DATABASE_URL);
let dbInstance = null;

if (isPostgres) {
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false
  });

  dbInstance = {
    type: 'postgres',
    async query(sql, params = []) {
      let index = 1;
      const convertedSql = sql.replace(/\?/g, () => `$${index++}`);
      const res = await pool.query(convertedSql, params);
      return res.rows;
    },
    async run(sql, params = []) {
      let index = 1;
      const convertedSql = sql.replace(/\?/g, () => `$${index++}`);
      const res = await pool.query(convertedSql, params);
      return { rowCount: res.rowCount };
    },
    async get(sql, params = []) {
      const rows = await this.query(sql, params);
      return rows[0] || null;
    },
    async all(sql, params = []) {
      return this.query(sql, params);
    },
    async close() {
      await pool.end();
    }
  };
} else {
  // Built-in node:sqlite in Node.js 22+ & 24+
  const { DatabaseSync } = require('node:sqlite');
  const dbPath = process.env.SQLITE_DB_PATH || path.join(__dirname, '..', 'smart_attend.db');
  const sqliteDb = new DatabaseSync(dbPath);

  // Enable foreign keys
  sqliteDb.exec('PRAGMA foreign_keys = ON;');

  dbInstance = {
    type: 'sqlite',
    async query(sql, params = []) {
      const stmt = sqliteDb.prepare(sql);
      return stmt.all(...params);
    },
    async run(sql, params = []) {
      const stmt = sqliteDb.prepare(sql);
      const info = stmt.run(...params);
      return { lastID: info.lastInsertRowid, changes: info.changes };
    },
    async get(sql, params = []) {
      const stmt = sqliteDb.prepare(sql);
      return stmt.get(...params) || null;
    },
    async all(sql, params = []) {
      return this.query(sql, params);
    },
    async close() {
      sqliteDb.close();
    }
  };
}

// Auto-initialize schema for sqlite or postgres
async function initDb() {
  const initSql = `
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(150) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) NOT NULL,
      avatar_url VARCHAR(255),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS classes (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(50) NOT NULL,
      department VARCHAR(50) NOT NULL,
      academic_year VARCHAR(20) NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS teachers (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL UNIQUE,
      department VARCHAR(50) NOT NULL,
      employee_code VARCHAR(50) UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS students (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL UNIQUE,
      roll_number VARCHAR(50) UNIQUE NOT NULL,
      department VARCHAR(50) NOT NULL,
      class_name VARCHAR(50) NOT NULL,
      semester INT DEFAULT 1,
      phone VARCHAR(20),
      parent_phone VARCHAR(20),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS subjects (
      id VARCHAR(36) PRIMARY KEY,
      subject_code VARCHAR(20) NOT NULL,
      subject_name VARCHAR(100) NOT NULL,
      department VARCHAR(50) NOT NULL,
      teacher_id VARCHAR(36),
      class_id VARCHAR(36),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS attendance (
      id VARCHAR(36) PRIMARY KEY,
      student_id VARCHAR(36) NOT NULL,
      subject_id VARCHAR(36) NOT NULL,
      date VARCHAR(10) NOT NULL,
      status VARCHAR(20) NOT NULL,
      remarks VARCHAR(255),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(student_id, subject_id, date)
    );

    CREATE TABLE IF NOT EXISTS leave_requests (
      id VARCHAR(36) PRIMARY KEY,
      student_id VARCHAR(36) NOT NULL,
      reason TEXT NOT NULL,
      leave_type VARCHAR(50) DEFAULT 'Medical',
      start_date VARCHAR(10) NOT NULL,
      end_date VARCHAR(10) NOT NULL,
      status VARCHAR(20) DEFAULT 'Pending',
      reviewed_by VARCHAR(36),
      reviewer_comments TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id VARCHAR(36) PRIMARY KEY,
      user_id VARCHAR(36) NOT NULL,
      title VARCHAR(150) NOT NULL,
      message TEXT NOT NULL,
      type VARCHAR(20) NOT NULL,
      is_read INT DEFAULT 0,
      student_id VARCHAR(36),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `;

  const statements = initSql
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const statement of statements) {
    await dbInstance.run(statement);
  }
}

module.exports = {
  db: dbInstance,
  initDb
};
