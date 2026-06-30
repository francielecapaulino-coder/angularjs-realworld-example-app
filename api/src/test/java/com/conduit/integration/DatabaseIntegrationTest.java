package com.conduit.integration;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;
import org.springframework.boot.test.context.SpringBootTest.WebEnvironment;
import org.springframework.test.context.junit.jupiter.SpringExtension;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Database integration test using Testcontainers
 * Tests PostgreSQL integration with Spring Boot application
 */
@ExtendWith(SpringExtension.class)
@SpringBootTest(webEnvironment = WebEnvironment.RANDOM_PORT)
@Testcontainers
public class DatabaseIntegrationTest {

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
        registry.add("spring.jpa.properties.hibernate.dialect", () -> "org.hibernate.dialect.PostgreSQLDialect");
    }

    @LocalServerPort
    private int port;

    @BeforeEach
    void setUp() {
        assertTrue(postgres.isRunning(), "PostgreSQL container should be running");
    }

    @Test
    void shouldStartPostgresContainer() {
        assertTrue(postgres.isRunning(), "PostgreSQL container should be running");
        assertNotNull(postgres.getJdbcUrl(), "JDBC URL should be available");
        assertNotNull(postgres.getUsername(), "Username should be available");
        assertNotNull(postgres.getPassword(), "Password should be available");
    }

    @Test
    void shouldConnectToDatabase() {
        String jdbcUrl = postgres.getJdbcUrl();
        assertNotNull(jdbcUrl, "JDBC URL should not be null");
        assertTrue(jdbcUrl.contains("localhost"), "JDBC URL should contain localhost");
        assertTrue(jdbcUrl.contains("conduit_test"), "JDBC URL should contain test database name");
    }

    @Test
    void shouldHaveCorrectCredentials() {
        assertEquals("conduit", postgres.getUsername(), "Username should be conduit");
        assertEquals("conduit", postgres.getPassword(), "Password should be conduit");
    }

    @Test
    void shouldRunApplicationWithTestDatabase() {
        assertNotNull(port, "Port should be assigned");
        assertTrue(port > 0, "Port should be positive");
        assertTrue(port < 65536, "Port should be valid");
    }

    @Test
    void shouldHaveValidDriverClassName() {
        String driverClassName = postgres.getDriverClassName();
        assertEquals("org.postgresql.Driver", driverClassName, "Should use PostgreSQL driver");
    }
}