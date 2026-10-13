package backend.config;

import jakarta.annotation.PostConstruct;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.Arrays;
import java.util.List;

@Configuration
public class WebSecurityConfiguration implements WebMvcConfigurer {
    private final boolean controlRequired;
    private final String controlToken;
    private final List<String> allowedOrigins;

    public WebSecurityConfiguration(
            @Value("${demo-control.required:false}") boolean controlRequired,
            @Value("${demo-control.token:}") String controlToken,
            @Value("${cors.allowed-origins:http://localhost:3000,http://127.0.0.1:3000}") String allowedOrigins) {
        this.controlRequired = controlRequired;
        this.controlToken = controlToken == null ? "" : controlToken;
        this.allowedOrigins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim).filter(origin -> !origin.isEmpty()).toList();
    }

    @PostConstruct
    void requireConfiguredTokenForPublicControls() {
        if (controlRequired && controlToken.isBlank())
            throw new IllegalStateException("DEMO_CONTROL_TOKEN must be set when DEMO_CONTROL_ENFORCE=true");
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigins.toArray(String[]::new))
                .allowedMethods("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS")
                .allowedHeaders("Content-Type", "X-Demo-Control-Token")
                .maxAge(3600);
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new DemoControlInterceptor()).addPathPatterns("/api/**");
    }

    private final class DemoControlInterceptor implements HandlerInterceptor {
        @Override
        public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
            if (!controlRequired || request.getMethod().equals("GET") || request.getMethod().equals("HEAD")
                    || request.getMethod().equals("OPTIONS")) return true;
            String supplied = request.getHeader("X-Demo-Control-Token");
            boolean valid = supplied != null && MessageDigest.isEqual(
                    controlToken.getBytes(StandardCharsets.UTF_8), supplied.getBytes(StandardCharsets.UTF_8));
            if (valid) return true;
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json");
            response.setCharacterEncoding(StandardCharsets.UTF_8.name());
            response.getWriter().write("{\"error\":\"A valid demo control token is required for this operation\"}");
            return false;
        }
    }
}
