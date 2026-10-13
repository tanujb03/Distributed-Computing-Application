#!/bin/sh
set -eu

class_dir="${EXPERIMENT10_CLASSES_DIR:-/tmp/experiment10-classes}"
mkdir -p "$class_dir"
mpj_classpath="/usr/share/mpj/lib/*:/usr/share/java/*"
matrix_size=${EXPERIMENT10_MATRIX_SIZE:-200}
ranks=${EXPERIMENT10_RANKS:-4}
case "$matrix_size" in ''|*[!0-9]*) echo "Matrix size must be a whole number." >&2; exit 2 ;; esac
case "$ranks" in ''|*[!0-9]*) echo "MPI process count must be a whole number." >&2; exit 2 ;; esac
if [ "$matrix_size" -lt 2 ] || [ "$matrix_size" -gt 512 ]; then echo "Matrix size must be between 2 and 512." >&2; exit 2; fi
if [ "$ranks" -lt 1 ] || [ "$ranks" -gt 64 ]; then echo "MPI process count must be between 1 and 64." >&2; exit 2; fi
if [ ! -f "$class_dir/mpi/ParallelMatrixMultiplication.class" ]; then
  javac -encoding UTF-8 -cp "$mpj_classpath" -d "$class_dir" /experiment10/src/mpi/ParallelMatrixMultiplication.java
fi
if [ "${MPJ_JAVA_TOOL_OPTIONS+x}" = x ]; then
  if [ -n "$MPJ_JAVA_TOOL_OPTIONS" ]; then
    export JAVA_TOOL_OPTIONS="$MPJ_JAVA_TOOL_OPTIONS"
  else
    unset JAVA_TOOL_OPTIONS
  fi
fi
exec mpjrun -np "$ranks" -dev multicore -cp "$class_dir:$mpj_classpath" mpi.ParallelMatrixMultiplication

