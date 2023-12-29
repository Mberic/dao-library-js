# syntax=docker.io/docker/dockerfile:1.4

FROM --platform=linux/riscv64 cartesi/node:20.8.0-jammy-slim as build-stage

# Install build dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        g++ \
        make \
        python3 \
        libsqlite3-0 \
        libsqlite3-dev && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /opt/cartesi/dapp

# Copy only the package.json files to leverage Docker caching
COPY package.json ./

RUN npm install

# Copy the rest of the application files
COPY . .

# Set the working directory to the location of package.json
WORKDIR /opt/cartesi/dapp/src/core/database

# Install dependencies
RUN npm install

# create database
RUN node create-tables.js


# runtime stage: produces final image that will be executed

# Here the image's platform MUST be linux/riscv64.
# Give preference to small base images, which lead to better start-up
# performance when loading the Cartesi Machine.
FROM --platform=linux/riscv64 cartesi/node:20.8.0-jammy-slim

LABEL io.sunodo.sdk_version=0.2.0
LABEL io.cartesi.rollups.ram_size=128Mi

ARG MACHINE_EMULATOR_TOOLS_VERSION=0.12.0
RUN <<EOF
apt-get update
apt-get install -y --no-install-recommends busybox-static=1:1.30.1-7ubuntu3 ca-certificates=20230311ubuntu0.22.04.1 curl=7.81.0-1ubuntu1.15
curl -fsSL https://github.com/cartesi/machine-emulator-tools/releases/download/v${MACHINE_EMULATOR_TOOLS_VERSION}/machine-emulator-tools-v${MACHINE_EMULATOR_TOOLS_VERSION}.tar.gz \
  | tar -C / --overwrite -xvzf -
rm -rf /var/lib/apt/lists/*
EOF

ENV PATH="/opt/cartesi/bin:${PATH}"

WORKDIR /opt/cartesi/dapp
COPY --from=build-stage /opt/cartesi/dapp .

ENV ROLLUP_HTTP_SERVER_URL="http://127.0.0.1:5004"

ENTRYPOINT ["rollup-init"]
CMD ["node", "src/index.js"]