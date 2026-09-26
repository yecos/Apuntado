import { NextResponse } from "next/server";
import { db, snapshot } from "../../../_db";

export async function POST(req,{params}) {
  try {
    const {code} = await params;
    const room = code.toUpperCase();
    const {token} = await req.json();
    const sql = db();
    const [g] = await sql`SELECT id FROM games WHERE code=${room}`;
    if (!g) return NextResponse.json({error:"Sala no encontrada."},{status:404});
    const [p] = await sql`SELECT id FROM players WHERE game_id=${g.id} AND token=${token}`;
    if (!p) return NextResponse.json({error:"No autorizado."},{status:403});
    await sql`UPDATE players SET score=0, eliminated=false WHERE game_id=${g.id}`;
    await sql`DELETE FROM rounds WHERE game_id=${g.id}`;
    return NextResponse.json(await snapshot(sql,room));
  } catch(e) {
    return NextResponse.json({error:e.message},{status:500});
  }
}
