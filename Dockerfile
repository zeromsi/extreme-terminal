FROM klovercloud/wetty:latest
RUN mkdir ~/.ssh && \
    echo '#!/usr/bin/env sh' >> /entrypoint.sh && \
    echo 'ssh-keyscan -H wetty-ssh >> ~/.ssh/known_hosts' >> /entrypoint.sh && \
    echo 'node .' >> /entrypoint.sh && \
    chmod +x /entrypoint.sh

ARG USERNAME
ARG PASS

RUN adduser --quiet --disabled-password --shell /bin/bash --home /home/$USERNAME --gecos "$USERNAME" $USERNAME
# set password
RUN echo "$USERNAME:$PASS" | sudo chpasswd

ENTRYPOINT [ "/entrypoint.sh" ]