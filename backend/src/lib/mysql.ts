// lib/mysql.js
import mysql2 from "mysql2/promise";
import dotenv from "dotenv";

// 加載 .env 檔案中的環境變數
dotenv.config();

// 使用從 .env 讀取的環境變數來設置 MySQL 配置
const mysqlConnectionPool = mysql2.createPool({
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
});

export default mysqlConnectionPool;
