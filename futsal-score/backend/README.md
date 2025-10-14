# Futsal Score Backend (Node.js + Express)

## Quick Start
1. Clone o repositório e entre na pasta.
2. Crie `.env` baseado em `.env.example`.
3. Rode `npm install` para instalar dependências.
4. Rode `npm run dev` (requer nodemon) ou `npm start`.

## Endpoints principais
- POST /api/auth/register — criar usuário
- POST /api/auth/login — login (recebe token)
- GET /api/teams — listar times
- POST /api/teams — criar time (autenticado)
- GET /api/matches — listar partidas
- POST /api/matches — criar partida (autenticado)
