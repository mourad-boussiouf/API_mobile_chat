/* create database connection */
const mysql = require('mysql2');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_DBNAME || 'chat-nodejs',
    queueLimit : 0, 
    connectionLimit : 0 
});

module.exports = pool.promise()