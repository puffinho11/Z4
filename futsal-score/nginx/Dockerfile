# Imagem base do NGINX
FROM nginx:alpine

# Remove o arquivo de configuração padrão
RUN rm /etc/nginx/conf.d/default.conf

# Copia o nosso arquivo de configuração personalizado
COPY default.conf /etc/nginx/conf.d/

# Expondo a porta 80
EXPOSE 80

# Comando padrão
CMD ["nginx", "-g", "daemon off;"]
