# Multi-stage runtime preserves the project's pinned Debian MPJ Express package.
FROM debian:bullseye-slim AS mpj-runtime
ENV DEBIAN_FRONTEND=noninteractive
RUN sed -i '/bullseye-security/d' /etc/apt/sources.list \
 && apt-get update \
 && apt-get install -y --no-install-recommends openjdk-11-jdk-headless libmpj-java=0.44+dfsg-4 \
 && ln -s /usr/share/java/log4j-1.2.jar /usr/share/mpj/lib/log4j-1.2.jar \
 && rm -rf /var/lib/apt/lists/*

FROM maven:3.9.9-eclipse-temurin-17 AS build
WORKDIR /workspace
COPY java-system ./java-system
COPY spring-boot-api ./spring-boot-api
COPY --from=mpj-runtime /usr/share/mpj /opt/mpj/usr/share/mpj
COPY --from=mpj-runtime /usr/share/java /opt/mpj/usr/share/java
RUN mvn -B -f spring-boot-api/pom.xml -DskipTests package \
 && mkdir -p /workspace/mpi/experiment9/classes /workspace/mpi/experiment10/classes \
 && MPJ_CP='/opt/mpj/usr/share/mpj/lib/*:/opt/mpj/usr/share/java/*' \
 && javac -encoding UTF-8 -cp "$MPJ_CP" -d /workspace/mpi/experiment9/classes java-system/shared/experiment9/src/mpi/MpiCollectiveDemo.java \
 && javac -encoding UTF-8 -cp "$MPJ_CP" -d /workspace/mpi/experiment10/classes java-system/shared/experiment10/src/mpi/ParallelMatrixMultiplication.java

FROM eclipse-temurin:17-jdk-jammy AS runtime
ENV MPJ_HOME=/usr/share/mpj PATH=/opt/java/openjdk/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
RUN apt-get update && apt-get install -y --no-install-recommends bash ca-certificates procps sed coreutils \
 && rm -rf /var/lib/apt/lists/* \
 && groupadd --system app && useradd --system --gid app --home-dir /opt/app --shell /usr/sbin/nologin app
COPY --from=mpj-runtime /usr/share/mpj /usr/share/mpj
COPY --from=mpj-runtime /usr/share/java /usr/share/java
COPY --from=mpj-runtime /usr/bin/mpjrun /usr/bin/mpjrun
COPY --from=mpj-runtime /etc/mpj /etc/mpj
RUN ln -sfn /usr/share/java/log4j-1.2.jar /usr/share/mpj/lib/log4j-1.2.jar
WORKDIR /opt/app
COPY --from=build /workspace/spring-boot-api/target/distributed-computing-spring-boot-api-0.1.0-SNAPSHOT.jar /opt/app/app.jar
COPY --from=build /workspace/spring-boot-api/target/classes /opt/app/classes
COPY --from=build /workspace/java-system /opt/app/java-system
COPY --from=build /workspace/mpi /opt/app/mpi
COPY spring-boot-api/scripts/start-render.sh /usr/local/bin/start-render
RUN chmod 0755 /usr/local/bin/start-render \
 && chown -R app:app /opt/app /usr/share/mpj /tmp
USER app
EXPOSE 10000
ENTRYPOINT ["/usr/local/bin/start-render"]


