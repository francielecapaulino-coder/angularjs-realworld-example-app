# syntax=docker/dockerfile:1

# ---- Build stage: compile the Spring Boot jar with the Gradle wrapper (JDK 25) ----
FROM eclipse-temurin:25-jdk AS build
WORKDIR /workspace

# Cache dependencies first: copy the wrapper + build scripts, then resolve.
COPY gradlew settings.gradle build.gradle ./
COPY gradle ./gradle
RUN chmod +x gradlew && ./gradlew --no-daemon dependencies > /dev/null 2>&1 || true

# Copy sources and build the boot jar. Tests run in CI (they need Postgres),
# so the image build skips them to stay fast and self-contained.
COPY src ./src
RUN ./gradlew --no-daemon clean bootJar -x test

# ---- Run stage: slim JRE running the fat jar ----
FROM eclipse-temurin:25-jre AS run
WORKDIR /app

# Non-root runtime user.
RUN groupadd --system spring && useradd --system --gid spring spring
USER spring:spring

COPY --from=build /workspace/build/libs/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
