FROM debian:bullseye-slim

ENV DEBIAN_FRONTEND=noninteractive
RUN sed -i '/bullseye-security/d' /etc/apt/sources.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends openjdk-11-jdk-headless libmpj-java=0.44+dfsg-4 \
    && ln -s /usr/share/java/log4j-1.2.jar /usr/share/mpj/lib/log4j-1.2.jar \
    && rm -rf /var/lib/apt/lists/*

ENV MPJ_HOME=/usr/share/mpj
COPY run-mpi.sh /usr/local/bin/run-mpi
RUN chmod 0755 /usr/local/bin/run-mpi
WORKDIR /experiment
ENTRYPOINT ["/usr/local/bin/run-mpi"]
