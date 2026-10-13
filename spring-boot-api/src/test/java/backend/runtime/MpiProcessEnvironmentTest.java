package backend.runtime;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;

class MpiProcessEnvironmentTest {
    @Test
    void removesGlobalJvmOptionsWithoutChangingMpiSpecificConfiguration() {
        ProcessBuilder builder = new ProcessBuilder("java", "-version");
        builder.environment().put("JAVA_TOOL_OPTIONS", "-Dglobal.option=must-not-leak");
        builder.environment().put("MPJ_JAVA_TOOL_OPTIONS", "-Xms8m -Xmx48m");

        MpiProcessEnvironment.clearGlobalJvmOptions(builder);

        assertFalse(builder.environment().containsKey("JAVA_TOOL_OPTIONS"));
        assertEquals("-Xms8m -Xmx48m", builder.environment().get("MPJ_JAVA_TOOL_OPTIONS"));
    }
}
