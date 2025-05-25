import mysqlConnectionPool from "../../../src/lib/mysql";
import { NextApiRequest, NextApiResponse } from "next";
import { ResultSetHeader } from "mysql2";

export const deleteVitalSign = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:3000");

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, err: "Method Not Allowed" });
  }

  const { signId } = req.body;

  // 檢查是否傳入 signId
  if (!signId) {
    return res.status(400).json({ success: false, err: "缺少 signId 參數" });
  }

  const connection = await mysqlConnectionPool.getConnection();
  try {
  // 開始交易
  await connection.beginTransaction();

  // 先刪除 alert 中與該 signId 相關的紀錄
  const [alertResult] = await connection.execute<ResultSetHeader>(
    'DELETE FROM alert WHERE signId = ?',
    [signId]
  );

  // 再刪除 vitalsigns 中的紀錄
  const [vitalResult] = await connection.execute<ResultSetHeader>(
    'DELETE FROM vitalsigns WHERE signId = ?',
    [signId]
  );

  // 如果都成功，提交交易
  await connection.commit();

  // 判斷是否真的有刪除紀錄
  if (vitalResult.affectedRows === 0) {
    return res.status(404).json({ success: false, message: '找不到對應的紀錄' });
  }
  return res.status(200).json({ success: true, message: '刪除成功' });

} catch (error) {
  // 若中途出錯則回滾交易
  await connection.rollback();
  return res.status(500).json({ success: false, message: '刪除失敗', error });

} finally {
    // 釋放連接回連接池
    connection.release();
  }
};
export default deleteVitalSign;
