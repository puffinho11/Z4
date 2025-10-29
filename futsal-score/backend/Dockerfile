# Etapa 1: usar Node
FROM node:18

# Define o diretório de trabalho
WORKDIR /app

# Copia apenas o backend (porque ele está dentro de futsal-score/backend)
COPY ./backend/package*.json ./

# Instala dependências do backend
RUN npm install

# Copia o resto do código do backend
COPY ./backend .

# Define a variável de ambiente para produção
ENV NODE_ENV=production

# Expõe a porta usada no backend
EXPOSE 3000

# Comando para iniciar o servidor
CMD ["node", "server.js"]



