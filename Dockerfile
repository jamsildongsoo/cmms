# Build stage
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app
COPY . .
RUN ./gradlew bootJar --no-daemon

# Run stage
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/build/libs/*.jar app.jar

# Render는 $PORT 환경변수를 사용하므로 이를 스프링에 전달합니다.
EXPOSE 10000
ENTRYPOINT ["java", "-Dserver.port=${PORT:10000}", "-jar", "app.jar"]