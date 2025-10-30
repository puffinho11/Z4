# Etapa 1 - Build
FROM node:20-alpine AS build
WORKDIR /app

# Copia apenas os arquivos de dependências
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia o resto do projeto
COPY . .

# Builda o app para produção
RUN npm run build

# Etapa 2 - Servidor NGINX para servir os arquivos
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html

# Expondo a porta 80
EXPOSE 80

# Comando de inicialização
CMD ["nginx", "-g", "daemon off;"]

