// server.js
require('dotenv').config(); // Carrega variáveis do .env

const express = require('express');
const cors = require('cors');
const connectDB = require('./db');

// Importar Rotas (criaremos depois)
const userRoutes = require('./routes/userRoutes');
const registroRoutes = require('./routes/registroRoutes');
const exameRoutes = require('./routes/exameRoutes');
const calendarioRoutes = require('./routes/calendarioRoutes');

// Conectar ao Banco de Dados
connectDB();

const app = express();

// Middlewares
app.use(cors()); // Permite requisições do seu front-end React
app.use(express.json()); // Permite o uso de body JSON nas requisições

// Rotas da API
app.use('/api/users', userRoutes);
app.use('/api/registros', registroRoutes);
app.use('/api/exames', exameRoutes);
app.use('/api/calendario', calendarioRoutes);

// Rota de Teste
app.get('/', (req, res) => {
  res.send('API Futsal Score Rodando...');
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));