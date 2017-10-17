# could use node:8, but it has an old libboost and the cli doesn't support it
FROM ubuntu:latest

# Prepare system
RUN apt update
RUN apt install -y curl git
RUN apt install -y libevent-dev libboost-system-dev libboost-filesystem-dev libboost-chrono-dev libboost-program-options-dev libboost-test-dev libboost-thread-dev
RUN curl -sL https://deb.nodesource.com/setup_8.x | bash -
RUN apt install -y nodejs

# Helium-cli conf
COPY ./docker/backend/helium-client.conf /root/.heliumcore/helium.conf

# Node app
WORKDIR /var/www/backend
# install dependencies before copying the full source
# this makes use of layer caching to only reinstall when package.json changes
# http://bitjudo.com/blog/2014/03/13/building-efficient-dockerfiles-node-dot-js/
ADD package.json /tmp/package.json
RUN cd /tmp && npm install
RUN mkdir -p /var/www/backend && cp -a /tmp/node_modules /var/www/backend/
# copy app src
COPY . /var/www/backend

EXPOSE 3000

# Run
CMD cp /coinbin/helium* /usr/local/bin/ && npm run db:migrations:run && node run dev