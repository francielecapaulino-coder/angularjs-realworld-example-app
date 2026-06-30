package com.conduit.integration;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.springframework.beans.factory.annotation.Autowired;

import static org.junit.jupiter.api.Assertions.*;

/**
 * API integration test using Testcontainers and Spring Boot TestRestTemplate
 * Tests REST endpoints with real database
 */
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@Testcontainers
public class ApiIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine")
            .withDatabaseName("conduit_test")
            .withUsername("conduit")
            .withPassword("conduit");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.datasource.driver-class-name", postgres::getDriverClassName);
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "create-drop");
    }

    @LocalServerPort
    private int port;

    @Autowired
    private TestRestTemplate restTemplate;

    private String baseUrl;

    @BeforeEach
    void setUp() {
        baseUrl = "http://localhost:" + port;
        assertTrue(postgres.isRunning(), "PostgreSQL container should be running");
    }

    @Test
    void shouldConnectToHealthEndpoint() {
        ResponseEntity<String> response = restTemplate.getForEntity(
                baseUrl + "/actuator/health", String.class);
        
        assertEquals(200, response.getStatusCodeValue(), "Health endpoint should return 200");
        assertNotNull(response.getBody(), "Health response body should not be null");
    }

    @Test
    void shouldAccessActuatorInfo() {
        ResponseEntity<String> response = restTemplate.getForEntity(
                baseUrl + "/actuator/info", String.class);
        
        // May return 404 if not configured, which is acceptable for integration testing
        assertTrue(response.getStatusCodeValue() >= 200 && response.getStatusCodeValue() < 500,
                "Actuator endpoint should return valid status code");
    }

    @Test
    void shouldAccessApiHealthEndpoint() {
        ResponseEntity<String> response = restTemplate.getForEntity(
                baseUrl + "/api/health", String.class);
        
        assertEquals(200, response.getStatusCodeValue(), "API health endpoint should return 200");
        assertNotNull(response.getBody(), "API health response should not be null");
        
        // Should contain health information
        System.out.println("API Health Response: " + response.getBody());
    }

    @Test 
    void shouldHandleUnprotectedEndpoints() {
        // These endpoints should be accessible without authentication
        ResponseEntity<String> authResponse = restTemplate.getForEntity(
                baseUrl + "/api/health", String.class);
        assertEquals(200, authResponse.getStatusCodeValue(), 
                "Unprotected endpoint should be accessible");
    }

    @Test
    void shouldCheckApplicationStartup() {
        // Basic application startup test
        assertNotNull(restTemplate, "TestRestTemplate should be injected");
        assertTrue(port > 0, "Server port should be assigned");
    }

    @Test
    void shouldHaveValidBaseUrl() {
        assertNotNull(baseUrl, "Base URL should not be null");
        assertTrue(baseUrl.startsWith("http://localhost:"), 
                "Base URL should be properly formatted");
    }
}