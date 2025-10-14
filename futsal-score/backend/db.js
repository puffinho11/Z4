// db.js
const mongoose = require('mongoose');

// Função para conectar ao banco de dados
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      // Essas opções são boas práticas, mas podem ser omitidas em Mongoose mais recente.
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    });
    console.log('MongoDB conectado com sucesso!');
  } catch (error) {
    console.error(`Erro ao conectar ao MongoDB: ${error.message}`);
    // Sair do processo em caso de falha
    process.exit(1);
  }
};

module.exports = connectDB;