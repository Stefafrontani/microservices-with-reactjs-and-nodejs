FROM node:alpine

# Fix create-react-app bug that prevents it from running correctly in a docker container
ENV CI=true

WORKDIR /app
COPY package.json ./
RUN npm install
copy ./ ./

CMD ["npm", "start"]