import { neon } from "@neondatabase/serverless";

export function db() {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL no está configurada.");
  return neon(process.env.DATABASE_URL);
}

export function code() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i=0;i<6;i++) out += chars[Math.floor(Math.random()*chars.length)];
  return out;
}

export function token() {
  return crypto.randomUUID().replaceAll("-","");
}

export async function snapshot(sql, room) {
  const [g] = await sql`
    SELECT id, code, name, target_score, created_at
    FROM games WHERE code=${room}
  `;
  if (!g) return null;
  const players = await sql`
    SELECT id, name, token, score, eliminated, created_at
    FROM players WHERE game_id=${g.id}
    ORDER BY eliminated ASC, score ASC, created_at ASC
  `;
  return {...g, players};
}
