import { NextResponse } from "next/server";
import { db, snapshot } from "../../../_db";

export async function POST(req,{params}) {
  try {
    const {code} = await params;
    const room = code.toUpperCase();
    const {token,delta} = await req.json();
    if (!token || !Number.isInteger(delta))
      return NextResponse.json({error:"Datos inválidos."},{status:400});

    const sql = db();
    const [g] = await sql`SELECT id,target_score FROM games WHERE code=${room}`;
    if (!g) return NextResponse.json({error:"Sala no encontrada."},{status:404});

    const [p] = await sql`
      SELECT id,score,eliminated FROM players
      WHERE game_id=${g.id} AND token=${token}
    `;
    if (!p) return NextResponse.json({error:"Jugador no encontrado."},{status:404});
    if (p.eliminated) return NextResponse.json({error:"Este jugador ya está eliminado."},{status:409});

    const next = p.score + delta;
    const eliminated = next >= g.target_score;

    await sql`
      UPDATE players SET score=${next}, eliminated=${eliminated} WHERE id=${p.id}
    `;
    await sql`
      INSERT INTO rounds (game_id,player_id,delta,score_after,note)
      VALUES (${g.id},${p.id},${delta},${next},${delta === -10 ? "Se bajó" : "Ronda"})
    `;
    return NextResponse.json(await snapshot(sql,room));
  } catch(e) {
    return NextResponse.json({error:e.message},{status:500});
  }
}
