# APUNTADO

MVP móvil para llevar el marcador de **Apuntado**.

## Reglas implementadas
- Cada jugador inicia en 0.
- En cada ronda se registra el valor de cartas que le quedan.
- Quien se baja puede registrar **-10 puntos**.
- Al llegar a **101 o más**, el jugador queda eliminado.
- Gana el último jugador activo.
- El tablero se ordena por menor puntaje.

## Multijugador
La app usa una sala con código. Cada celular entra con el mismo código y nombre.
Con `DATABASE_URL` configurada en Vercel/Neon, los cambios se comparten entre dispositivos.
Sin base de datos, la interfaz muestra el error de conexión.

## Base de datos
Ejecuta `schema.sql` en Neon.

## Desarrollo
```bash
npm install
npm run dev
```

## Deploy
Sube el proyecto a GitHub, conecta el repo a Vercel, agrega `DATABASE_URL`
y ejecuta `schema.sql` en Neon.
