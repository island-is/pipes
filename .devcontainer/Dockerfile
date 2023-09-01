ARG NODE_VERSION=20.5.0
FROM mcr.microsoft.com/devcontainers/base:ubuntu
RUN set -x \
    && curl -sL 'https://deb.nodesource.com/setup_20.x' | bash - \
    && apt-get -y install g++ make nodejs \
    && ln -s /usr/bin/nodejs /usr/local/bin/node