package com.conduit.config;

import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Timer;
import org.springframework.stereotype.Component;

/**
 * Metrics configuration for Prometheus
 */
@Component
public class MetricsConfig {
    
    private final MeterRegistry meterRegistry;
    private final Counter requestCounter;
    private final Timer responseTimer;
    
    public MetricsConfig(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
        this.requestCounter = Counter.builder("http_requests_total")
                .description("Total HTTP requests")
                .register(meterRegistry);
        this.responseTimer = Timer.builder("http_response_time")
                .description("HTTP response time")
                .register(meterRegistry);
    }
    
    public void incrementRequestCounter() {
        requestCounter.increment();
    }
    
    public Timer.Sample startTimer() {
        return Timer.start(meterRegistry);
    }
    
    public void recordResponseTime(Timer.Sample sample) {
        sample.stop(responseTimer);
    }
}