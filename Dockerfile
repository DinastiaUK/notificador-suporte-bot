# 1. Usar uma imagem base oficial e leve do Node.js
FROM node:18-alpine

# 2. Definir o diretório de trabalho dentro do container
WORKDIR /usr/src/app

# 3. Copiar os arquivos de dependências (para otimizar o cache do Docker)
COPY package*.json ./

# 4. Instalar as dependências da aplicação
RUN npm install

# 5. Copiar o restante do código do nosso bot
COPY . .

# 6. Comando para iniciar o bot quando o container for executado
CMD [ "node", "index.js" ]