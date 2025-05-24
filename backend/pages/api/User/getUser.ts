import type { NextApiRequest, NextApiResponse } from "next";
import { parse } from "cookie";
import mysqlConnectionPool from "../../../src/lib/mysql";
import { RowDataPacket } from "mysql2";

interface UserRow extends RowDataPacket {
  userId: number;
  username: string;
  email: string;
  role: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // 跨域設定
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  const cookieHeader = req.headers.cookie;
  const cookies = cookieHeader ? parse(cookieHeader) : {};
  const uid = cookies.uid;

  if (!uid) {
    return res
      .status(401)
      .json({ success: false, message: "未登入或缺少 uid cookie" });
  }
  // 連接 DB
  try {
    const connection = await mysqlConnectionPool.getConnection();

    // 從 DB 依照 uid 抓取資料
    try {
      const [rows] = await connection.execute<UserRow[]>(
        "SELECT username, email, role FROM user WHERE userId = ?",
        [uid]
      );

      if (rows.length === 0) {
        return res
          .status(404)
          .json({ success: false, message: "找不到使用者" });
      }

      return res.status(200).json({ success: true, user: rows[0] });
    } finally {
      connection.release();
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "未知錯誤";
    return res.status(500).json({ success: false, message });
  }
}
