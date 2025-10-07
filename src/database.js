import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

export class Database {
  constructor() {
    this.dbPath = process.env.DATABASE_PATH || './data/bot.db';
    this.init();
  }

  // Вспомогательная функция для создания локального timestamp
  getLocalTimestamp() {
    const now = new Date();
    return now.getFullYear() + '-' + 
      String(now.getMonth() + 1).padStart(2, '0') + '-' + 
      String(now.getDate()).padStart(2, '0') + ' ' +
      String(now.getHours()).padStart(2, '0') + ':' + 
      String(now.getMinutes()).padStart(2, '0') + ':' + 
      String(now.getSeconds()).padStart(2, '0');
  }

  init() {
    // Создаем директорию для базы данных, если её нет
    const dbDir = path.dirname(this.dbPath);
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    this.db = new sqlite3.Database(this.dbPath, (err) => {
      if (err) {
        console.error('Ошибка при подключении к базе данных:', err.message);
      } else {
        console.log('✅ Подключение к базе данных установлено');
        this.createTables();
      }
    });
  }

  createTables() {
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        chatId INTEGER PRIMARY KEY,
        lastCycleDate TEXT NOT NULL,
        cycleLength INTEGER DEFAULT 28,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    this.db.run(createUsersTable, (err) => {
      if (err) {
        console.error('Ошибка при создании таблицы users:', err.message);
      } else {
        console.log('✅ Таблица users создана');
      }
    });
  }

  saveUser(chatId, lastCycleDate, cycleLength = 28) {
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT OR REPLACE INTO users (chatId, lastCycleDate, cycleLength, updatedAt)
        VALUES (?, ?, ?, ?)
      `;
      
      this.db.run(sql, [chatId, lastCycleDate.toISOString(), cycleLength, this.getLocalTimestamp()], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
      });
    });
  }

  getUser(chatId) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM users WHERE chatId = ?';
      
      this.db.get(sql, [chatId], (err, row) => {
        if (err) {
          reject(err);
        } else if (row) {
          // Преобразуем строки дат обратно в объекты Date
          resolve({
            ...row,
            lastCycleDate: new Date(row.lastCycleDate),
            createdAt: new Date(row.createdAt),
            updatedAt: new Date(row.updatedAt)
          });
        } else {
          resolve(null);
        }
      });
    });
  }

  getAllUsers() {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM users';
      
      this.db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          // Преобразуем строки дат обратно в объекты Date
          const users = rows.map(row => ({
            ...row,
            lastCycleDate: new Date(row.lastCycleDate),
            createdAt: new Date(row.createdAt),
            updatedAt: new Date(row.updatedAt)
          }));
          resolve(users);
        }
      });
    });
  }

  updateUser(chatId, updates) {
    return new Promise((resolve, reject) => {
      const fields = [];
      const values = [];
      
      Object.keys(updates).forEach(key => {
        if (key === 'lastCycleDate' && updates[key] instanceof Date) {
          fields.push(`${key} = ?`);
          values.push(updates[key].toISOString());
        } else if (key !== 'chatId') {
          fields.push(`${key} = ?`);
          values.push(updates[key]);
        }
      });
      
      values.push(chatId);
      
      fields.push('updatedAt = ?');
      values.push(this.getLocalTimestamp());
      
      const sql = `
        UPDATE users 
        SET ${fields.join(', ')}
        WHERE chatId = ?
      `;
      
      this.db.run(sql, values, function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
      });
    });
  }

  deleteUser(chatId) {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM users WHERE chatId = ?';
      
      this.db.run(sql, [chatId], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes);
        }
      });
    });
  }

  close() {
    return new Promise((resolve) => {
      this.db.close((err) => {
        if (err) {
          console.error('Ошибка при закрытии базы данных:', err.message);
        } else {
          console.log('✅ База данных закрыта');
        }
        resolve();
      });
    });
  }
}
