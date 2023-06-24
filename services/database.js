/* create database connection */
const mysql = require('mysql2');

const pool = mysql.createPool({
    host: process.env.HOST || 'localhost',
    user: process.env.USER || 'root',
    password: process.env.PASSWORD || '',
    database: process.env.DB || 'chat-nodejs',
    queueLimit : 0, 
    connectionLimit : 0 
});

module.exports = pool.promise()