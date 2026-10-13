#!/bin/sh
set -eu

class_dir="${EXPERIMENT9_CLASSES_DIR:-/tmp/experiment9-classes}"
mkdir -p "$class_dir"
mpj_classpath="/usr/share/mpj/lib/*:/usr/share/java/*"
if [ ! -f "$class_dir/mpi/MpiCollectiveDemo.class" ]; then
  javac -encoding UTF-8 -cp "$mpj_classpath" -d "$class_dir" /experiment/src/mpi/MpiCollectiveDemo.java
fi
if [ "${MPJ_JAVA_TOOL_OPTIONS+x}" = x ]; then
  if [ -n "$MPJ_JAVA_TOOL_OPTIONS" ]; then
    export JAVA_TOOL_OPTIONS="$MPJ_JAVA_TOOL_OPTIONS"
  else
    unset JAVA_TOOL_OPTIONS
  fi
fi
exec mpjrun -np "${EXPERIMENT9_RANKS:-4}" -dev multicore -cp "$class_dir:$mpj_classpath" mpi.MpiCollectiveDemo

