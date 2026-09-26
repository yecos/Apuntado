"use client";

import { useEffect, useMemo, useState } from "react";

const API = "/api";

function useStored(key, initial="") {
  const [value, setValue] = useState(initial);
  useEffect(() => {
    const saved = localStorage.getItem(key);
    if (saved) setValue(saved);
  }, [key]);
  const update = (v) => {
    setValue(v);
    if (v) localStorage.setItem(key, v);
    else localStorage.removeItem(key);
  };
  return [value, update];
}

export default function Home() {
  const [room, setRoom] = useStored("apuntado_room");
  const [token, setToken] = useStored("apuntado_token");
  const [name, setName] = useStored("apuntado_name");
  const [draftName, setDraftName] = useState("");
  const [draftRoom, setDraftRoom] = useState("");
  const [game, setGame] = useState(null);
  const [points, setPoints] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const me = useMemo(
    () => game?.players?.find(p => p.token === token),
    [game, token]
  );

  async function request(path, options={}) {
    const r = await fetch(`${API}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      cache: "no-store"
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.error || "Ocurrió un error");
    return data;
  }

  async function refresh(code=room) {
    if (!code) return;
    try {
      const data = await request(`/games/${code}`);
      setGame(data);
      setError("");
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    if (!room) return;
    refresh(room);
    const id = setInterval(() => refresh(room), 1800);
    return () => clearInterval(id);
  }, [room]);

  async function createGame() {
    if (!draftName.trim()) return setError("Escribe tu nombre.");
    setBusy(true); setError("");
    try {
      const data = await request("/games", {
        method: "POST",
        body: JSON.stringify({ name: draftName.trim() })
      });
      setRoom(data.code); setToken(data.token); setName(draftName.trim());
      setDraftRoom(data.code);
      setGame(data.game);
    } catch(e) { setError(e.message); }
    finally { setBusy(false); }
  }

  async function joinGame() {
    if (!draftName.trim() || !draftRoom.trim())
      return setError("Escribe tu nombre y el código de sala.");
    setBusy(true); setError("");
    try {
      const data = await request(`/games/${draftRoom.trim().toUpperCase()}/join`, {
        method: "POST",
        body: JSON.stringify({ name: draftName.trim() })
      });
      setRoom(data.code); setToken(data.token); setName(draftName.trim());
      setGame(data.game);
    } catch(e) { setError(e.message); }
    finally { setBusy(false); }
  }

  async function addScore(delta) {
    if (!me || busy) return;
    const val = Number(delta);
    if (!Number.isInteger(val)) return setError("Ingresa un número válido.");
    setBusy(true); setError("");
    try {
      const data = await request(`/games/${room}/score`, {
        method: "POST",
        body: JSON.stringify({ token, delta: val })
      });
      setGame(data);
      setPoints("");
    } catch(e) { setError(e.message); }
    finally { setBusy(false); }
  }

  async function resetGame() {
    if (!confirm("¿Reiniciar todos los puntajes de esta partida?")) return;
    setBusy(true);
    try {
      const data = await request(`/games/${room}/reset`, {
        method: "POST",
        body: JSON.stringify({ token })
      });
      setGame(data);
    } catch(e) { setError(e.message); }
    finally { setBusy(false); }
  }

  function leave() {
    setRoom(""); setToken(""); setName("");
    setGame(null); setDraftName(""); setDraftRoom("");
  }

  if (!room) {
    return (
      <main className="shell homeShell">
        <section className="brandBlock">
          <div className="cardsMark">
            <span>♥</span><span>♠</span><span>♦</span>
          </div>
          <p className="eyebrow">JUEGO DE CARTAS</p>
          <h1>APUNTADO</h1>
          <p className="lead">El marcador de la mesa. Rápido, claro y sin volver a sacar calculadora.</p>
        </section>

        <section className="panel">
          <label>Tu nombre</label>
          <input value={draftName} onChange={e => setDraftName(e.target.value)}
            placeholder="Ej. Mateo" maxLength={40} />

          <button className="primary" disabled={busy} onClick={createGame}>
            {busy ? "Creando…" : "Crear nueva partida"}
          </button>

          <div className="or"><span>o únete a una mesa</span></div>

          <label>Código</label>
          <input className="codeInput" value={draftRoom}
            onChange={e => setDraftRoom(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,6))}
            placeholder="ABC123" maxLength={6} />

          <button className="secondary" disabled={busy} onClick={joinGame}>
            Entrar a la partida
          </button>

          {error && <p className="error">{error}</p>}
        </section>
      </main>
    );
  }

  const active = game?.players?.filter(p => !p.eliminated) || [];
  const leader = active.length ? [...active].sort((a,b)=>a.score-b.score)[0] : null;
  const winner = active.length === 1 && (game?.players?.length || 0) > 1 ? active[0] : null;

  return (
    <main className="shell gameShell">
      <header className="topbar">
        <div>
          <p className="eyebrow">SALA</p>
          <button className="roomCode" onClick={() => navigator.clipboard?.writeText(room)}>{room}</button>
        </div>
        <button className="ghost" onClick={leave}>Salir</button>
      </header>

      {winner && (
        <section className="winner">
          <div className="crown">♛</div>
          <div><small>GANADOR</small><strong>{winner.name}</strong></div>
        </section>
      )}

      <section className="scoreHero">
        <div>
          <span>Tu marcador</span>
          <strong>{me?.score ?? "—"}</strong>
          <small>{me?.eliminated ? "Eliminado" : `${Math.max(0, 101-(me?.score||0))} para 101`}</small>
        </div>
        <div className="meter">
          <i style={{width:`${Math.min(100, Math.max(0,(me?.score||0)/101*100))}%`}} />
        </div>
      </section>

      {!me?.eliminated && (
        <section className="entryCard">
          <h2>Registrar ronda</h2>
          <div className="entryRow">
            <input inputMode="numeric" value={points}
              onChange={e => setPoints(e.target.value.replace(/[^\d-]/g,""))}
              placeholder="Puntos" />
            <button className="primary compact" disabled={busy || points === ""} onClick={() => addScore(points)}>
              Sumar
            </button>
          </div>
          <button className="winRound" disabled={busy} onClick={() => addScore(-10)}>
            <span>✓</span> Me bajé — restar 10
          </button>
        </section>
      )}

      <section className="standings">
        <div className="sectionTitle">
          <div><p className="eyebrow">EN VIVO</p><h2>Tabla</h2></div>
          <span>{game?.players?.length || 0} jugadores</span>
        </div>

        <div className="players">
          {(game?.players || []).map((p, idx) => (
            <article key={p.id} className={`player ${p.eliminated ? "out" : ""} ${p.token===token ? "mine" : ""}`}>
              <div className="position">{p.eliminated ? "×" : idx+1}</div>
              <div className="avatar">{p.name.slice(0,1).toUpperCase()}</div>
              <div className="playerName">
                <strong>{p.name}{p.token===token ? " · tú" : ""}</strong>
                <small>
                  {p.eliminated ? "Eliminado" : leader?.id===p.id ? "Va ganando" : `${101-p.score} para 101`}
                </small>
              </div>
              <div className="points">{p.score}</div>
            </article>
          ))}
        </div>
      </section>

      <section className="rules">
        <strong>Regla actual</strong>
        <span>101 elimina · bajarse = −10</span>
      </section>

      <button className="dangerGhost" onClick={resetGame}>Reiniciar partida</button>
      {error && <p className="error floating">{error}</p>}
    </main>
  );
}
