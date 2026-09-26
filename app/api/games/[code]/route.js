import { NextResponse } from "next/server";
import { db, snapshot } from "../../_db";

export async function GET(req,{params}) {
  try {
    const {code} = await params;
    const sql = db();
    const game = await snapshot(sql, code.toUpperCase());
    if (!game) return NextResponse.json({error:"Sala no encontrada."},{status:404});
    return NextResponse.json(game);
  } catch(e) {
    return NextResponse.json({error:e.message},{status:500});
  }
}
