import { NextResponse } from "next/server";
import { db, token as newToken, snapshot } from "../../../_db";

export async function POST(req,{params}) {
  try {
    const {code} = await params;
    const room = code.toUpperCase();
    const {name} = await req.json();
    if (!name?.trim()) return NextResponse.json({error:"Falta el nombre."},{status:400});
    const sql = db();
    const [g] = await sql`SELECT id FROM games WHERE code=${room}`;
    if (!g) return NextResponse.json({error:"Sala no encontrada."},{status:404});
    const t = newToken();
    try {
      await sql`INSERT INTO players (game_id,name,token) VALUES (${g.id},${name.trim()},${t})`;
    } catch {
      return NextResponse.json({error:"Ese nombre ya está en la partida."},{status:409});
    }
    return NextResponse.json({code:room,token:t,game:await snapshot(sql,room)});
  } catch(e) {
    return NextResponse.json({error:e.message},{status:500});
  }
}
