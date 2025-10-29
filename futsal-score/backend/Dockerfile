# Usa imagem base do Node
FROM node:18

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia apenas os arquivos necessários para instalar dependências
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante do código do backend
COPY . .

# Expõe a porta que o servidor usa
EXPOSE 3000

# Define o comando padrão
CMD ["node", "server.js"]



