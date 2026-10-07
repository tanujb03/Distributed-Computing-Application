#!/bin/sh
set -eu

class_dir=/tmp/experiment9-classes
mkdir -p "$class_dir"
mpj_classpath="/usr/share/mpj/lib/*:/usr/share/java/*"
javac -encoding UTF-8 -cp "$mpj_classpath" -d "$class_dir" /experiment/src/mpi/MpiCollectiveDemo.java
exec mpjrun -np "${EXPERIMENT9_RANKS:-4}" -dev multicore -cp "$class_dir:$mpj_classpath" mpi.MpiCollectiveDemo
