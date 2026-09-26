import { NextResponse } from "next/server";
import { db, code as newCode, token as newToken, snapshot } from "../_db";

export async function POST(req) {
  try {
    const { name } = await req.json();
    if (!name?.trim()) return NextResponse.json({error:"Falta el nombre."},{status:400});
    const sql = db();
    let room = newCode();
    let game;
    for (let i=0;i<5;i++) {
      try {
        [game] = await sql`INSERT INTO games (code) VALUES (${room}) RETURNING *`;
        break;
      } catch { room = newCode(); }
    }
    if (!game) throw new Error("No se pudo crear la sala.");
    const t = newToken();
    await sql`INSERT INTO players (game_id,name,token) VALUES (${game.id},${name.trim()},${t})`;
    return NextResponse.json({code:room, token:t, game:await snapshot(sql,room)});
  } catch(e) {
    return NextResponse.json({error:e.message || "Error al crear partida."},{status:500});
  }
}
