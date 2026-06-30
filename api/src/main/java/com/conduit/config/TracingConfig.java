package com.conduit.config;

import io.micrometer.tracing.Tracer;
import org.springframework.context.annotation.Configuration;

@Configuration
public class TracingConfig {
    // Spring Boot will auto-configure tracing with micrometer-tracing-bridge-brave
}