import { Pool } from "pg";

const connectionString =
  process.env.DATABASE_URL ??
  "postgres://postgres:postgres@localhost:5432/mywhatsappmsg";

export const pool = new Pool({ connectionString });

export async function query<T = unknown>(
  text: string,
  params?: unknown[]
): Promise<T[]> {
  const res = await pool.query(text, params);
  return res.rows as T[];
}
