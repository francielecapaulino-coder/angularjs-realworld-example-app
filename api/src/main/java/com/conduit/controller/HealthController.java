package com.conduit.controller;

import io.micrometer.core.instrument.Counter;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class HealthController {

    private final Counter apiRequestCounter;

    public HealthController(Counter apiRequestCounter) {
        this.apiRequestCounter = apiRequestCounter;
    }

    @GetMapping("/health")
    public String health() {
        apiRequestCounter.increment();
        return "OK";
    }

    @GetMapping("/test-metrics")
    public String testMetrics() {
        apiRequestCounter.increment();
        return "Metrics test endpoint";
    }
}