package com.conduit.controller;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class HealthController {

    private static final Logger log = LoggerFactory.getLogger(HealthController.class);
    private final Counter apiRequestCounter;

    public HealthController(Counter apiRequestCounter) {
        this.apiRequestCounter = apiRequestCounter;
    }

    @GetMapping("/health")
    public String health() {
        log.info("Health check requested");
        apiRequestCounter.increment();
        return "OK";
    }

    @GetMapping("/test-logging")
    public String testLogging() {
        log.info("Log test endpoint called");
        apiRequestCounter.increment();
        return "Logging test completed";
    }
}