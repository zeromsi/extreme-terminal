FROM node:dubnium-alpine as builder
RUN apk add -U build-base python
WORKDIR /usr/src/app
COPY . /usr/src/app
RUN yarn && \
    yarn build && \
    yarn install --production --ignore-scripts --prefer-offline

FROM node:dubnium-alpine3.10
LABEL maintainer="butlerx@notthe.cloud"
RUN apk add -U build-base python
RUN apk --no-cache update \
    && apk --no-cache add openjdk8-jre

RUN apk add --update --no-cache ca-certificates openjdk8 python

ENV CASSANDRA_VERSION 3.11.8
ENV CASSANDRA_HOME /abc/cassandra

WORKDIR /usr/src/app
ENV NODE_ENV=production

COPY --from=builder /usr/src/app/dist /usr/src/app/dist
COPY --from=builder /usr/src/app/node_modules /usr/src/app/node_modules
COPY package.json /usr/src/app
COPY index.js /usr/src/app
RUN apk add -U openssh-client sshpass && \
    mkdir ~/.ssh && \
    echo '#!/usr/bin/env sh' >> /entrypoint.sh && \
    echo 'ssh-keyscan -H wetty-ssh >> ~/.ssh/known_hosts' >> /entrypoint.sh && \
    echo 'node .' >> /entrypoint.sh && \
    chmod +x /entrypoint.sh


RUN apk add -U mysql-client

RUN apk update \
    apk add --no-cache mongodb mongodb-tools

VOLUME /data/db


COPY run.sh /root


RUN apk add  postgresql-client

RUN apk --update add redis

EXPOSE 3000 27017 28017 7000 7001 7199 9042 9160 


ARG USERNAME
ARG PASS

RUN adduser -D -h /home/$USERNAME -s /bin/sh $USERNAME && \
    ( echo "$USERNAME:$PASS" | chpasswd )

RUN wget --output-document - http://ftp.riken.jp/net/apache/cassandra/$CASSANDRA_VERSION/apache-cassandra-$CASSANDRA_VERSION-bin.tar.gz | tar zxvf - 
#   mv apache-cassandra-$CASSANDRA_VERSION $CASSANDRA_HOME
RUN mkdir /var/lib/cassandra /var/log/cassandra
ENV PATH $PATH:$CASSANDRA_HOME/bin

ENTRYPOINT [ "/entrypoint.sh","/root/run.sh" ]
CMD ["mysql","mongod", "--bind_ip", "0.0.0.0","./cassandra", "-R", "-f" ]

# cassendra