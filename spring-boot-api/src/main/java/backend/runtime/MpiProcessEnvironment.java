package backend.runtime;

import java.util.Map;

/** Keeps platform-wide JVM options out of MPI subprocess trees. */
public final class MpiProcessEnvironment {
    private MpiProcessEnvironment() { }

    /**
     * JAVA_TOOL_OPTIONS is automatically consumed by every JVM in a process
     * tree. The MPI scripts translate the dedicated MPJ_JAVA_TOOL_OPTIONS
     * variable immediately before invoking mpjrun, so don't forward a global
     * JAVA_TOOL_OPTIONS value to either launcher here.
     */
    public static void clearGlobalJvmOptions(ProcessBuilder builder) {
        Map<String, String> environment = builder.environment();
        environment.remove("JAVA_TOOL_OPTIONS");
    }
}
