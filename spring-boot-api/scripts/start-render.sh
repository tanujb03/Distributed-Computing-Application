#!/bin/bash
set -Eeuo pipefail

# JAVA_TOOL_OPTIONS is process-global and would affect the API and every RMI
# JVM. Capture the dedicated MPI setting, then scrub both variables from the
# startup shell so the RMI JVMs and coordinator inherit neither one. Only the
# API receives MPJ_JAVA_TOOL_OPTIONS for its Experiment 9/10 subprocesses.
mpj_java_tool_options="${MPJ_JAVA_TOOL_OPTIONS:-}"
unset JAVA_TOOL_OPTIONS MPJ_JAVA_TOOL_OPTIONS

PIDS=()
TAIL_PIDS=()
shutdown() {
  trap - TERM INT EXIT
  for pid in "${PIDS[@]}"; do kill -TERM "$pid" 2>/dev/null || true; done
  for pid in "${PIDS[@]}"; do wait "$pid" 2>/dev/null || true; done
  for pid in "${TAIL_PIDS[@]}"; do kill "$pid" 2>/dev/null || true; done
}
trap shutdown TERM INT EXIT

mkdir -p /tmp/distributed-computing-logs
for id in 1 2 3 4; do
  port=$((5000 + id))
  java -Xms8m -Xmx32m -XX:MaxMetaspaceSize=40m -XX:+UseSerialGC -Djava.rmi.server.hostname=127.0.0.1 \
    -cp /opt/app/classes node.NodeServer "$id" "$port" 0 --server-only \
    >"/tmp/distributed-computing-logs/node-${id}.log" 2>&1 &
  PIDS+=("$!")
  (tail -n +1 -F "/tmp/distributed-computing-logs/node-${id}.log" 2>/dev/null | sed -u "s/^/[node-${id}] /") &
  TAIL_PIDS+=("$!")
done
java -Xms8m -Xmx32m -XX:MaxMetaspaceSize=40m -XX:+UseSerialGC -Djava.rmi.server.hostname=127.0.0.1 \
  -cp /opt/app/classes coordinator.CoordinatorServer \
  >/tmp/distributed-computing-logs/coordinator.log 2>&1 &
PIDS+=("$!")
(tail -n +1 -F /tmp/distributed-computing-logs/coordinator.log 2>/dev/null | sed -u 's/^/[coordinator] /') &
TAIL_PIDS+=("$!")

ready=false
for attempt in $(seq 1 60); do
  alive=true
  for pid in "${PIDS[@]}"; do kill -0 "$pid" 2>/dev/null || alive=false; done
  if [[ "$alive" == true ]] && java -cp /opt/app/classes backend.runtime.RmiReadinessProbe 1 2 3 4 >/dev/null 2>&1 \
      && java -cp /opt/app/classes backend.runtime.CoordinatorReadinessProbe >/dev/null 2>&1; then ready=true; break; fi
  sleep 1
done
if [[ "$ready" != true ]]; then echo 'RMI services failed readiness probes; see logs above.' >&2; exit 1; fi
echo 'Coordinator and all four independent RMI node processes are ready.'
MPJ_JAVA_TOOL_OPTIONS="$mpj_java_tool_options" java -Xms32m -Xmx480m -XX:MaxMetaspaceSize=112m -XX:+UseSerialGC -Djava.rmi.server.hostname=127.0.0.1 -jar /opt/app/app.jar &
api_pid=$!
PIDS+=("$api_pid")
wait "$api_pid"

