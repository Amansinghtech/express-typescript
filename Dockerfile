FROM node:latest

# Create app directory
RUN mkdir -p /home/app

# Set work directory    
WORKDIR /home/app   

# Copy app source code  

COPY . /home/app

# Install app dependencies  
RUN yarn install

ENV MONGO_URI=mongodb+srv://dbadmin:maP1HO4JZoxoG5bm@cluster0.zvuk7wj.mongodb.net/gossip?retryWrites=true&w=majority

# Build app source code
RUN yarn build

CMD ["yarn", "start"]
