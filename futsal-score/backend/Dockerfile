# Usa imagem oficial do Node
FROM node:18

# Cria pasta dentro do container
WORKDIR /app

# Copia os arquivos do backend
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia o restante do código
COPY . .

# Expõe a porta 3000 (a mesma do teu backend)
EXPOSE 3000

# Comando para iniciar o servidor
CMD ["npm", "start"]
