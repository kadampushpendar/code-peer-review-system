FROM maven:3.9-eclipse-temurin-25 AS build

WORKDIR /workspace
COPY pom.xml .
COPY .mvn .mvn
COPY mvnw .
RUN chmod +x mvnw
COPY src src
RUN ./mvnw -B -DskipTests package

FROM eclipse-temurin:25-jre

WORKDIR /app
COPY --from=build /workspace/target/peer-review-1.0.0.jar app.jar
EXPOSE 8080
CMD ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar /app/app.jar"]
