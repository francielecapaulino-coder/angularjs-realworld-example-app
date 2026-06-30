package com.conduit.config;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.HandlerInterceptor;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Configuration
public class MetricsConfig implements WebMvcConfigurer {

    private final MeterRegistry meterRegistry;

    public MetricsConfig(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new MetricsInterceptor(meterRegistry));
    }

    public static class MetricsInterceptor implements HandlerInterceptor {
        private final MeterRegistry meterRegistry;

        public MetricsInterceptor(MeterRegistry meterRegistry) {
            this.meterRegistry = meterRegistry;
        }

        @Override
        public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
            // Increment counter for each HTTP request
            Counter.builder("http_requests_total")
                    .description("Total number of HTTP requests")
                    .tag("method", request.getMethod())
                    .tag("uri", request.getRequestURI())
                    .tag("status", String.valueOf(response.getStatus()))
                    .register(meterRegistry)
                    .increment();
            return true;
        }

        @Override
        public void afterCompletion(HttpServletRequest request, HttpServletResponse response, Object handler, Exception ex) throws Exception {
            // Update counter with actual status after request completes
            Counter.builder("http_requests_total")
                    .description("Total number of HTTP requests")
                    .tag("method", request.getMethod())
                    .tag("uri", request.getRequestURI())
                    .tag("status", String.valueOf(response.getStatus()))
                    .register(meterRegistry)
                    .increment();
        }
    }

    @Bean
    public Counter apiRequestCounter(MeterRegistry meterRegistry) {
        return Counter.builder("api_requests_total")
                .description("Total API requests")
                .tag("application", "conduit-backend")
                .register(meterRegistry);
    }
}