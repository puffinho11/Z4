# Usa uma imagem oficial do Node.js
FROM node:18

# Define o diretório de trabalho
WORKDIR /app

# Copia os arquivos de dependências do backend
COPY ./backend/package*.json ./

# Instala as dependências
RUN npm install

# Copia todo o conteúdo do backend para dentro da imagem
COPY ./backend .

# Expõe a porta do servidor
EXPOSE 3000

# Comando para iniciar o backend
CMD ["npm", "start"]

