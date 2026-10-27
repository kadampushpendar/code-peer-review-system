FROM maven:3.9-eclipse-temurin-25 AS build

WORKDIR /workspace
COPY pom.xml .
COPY src src
RUN mvn -B -DskipTests package

FROM eclipse-temurin:25-jre

WORKDIR /app
COPY --from=build /workspace/target/peer-review-1.0.0.jar app.jar
ENV SPRING_PROFILES_ACTIVE=prod,mysql
EXPOSE 80
CMD ["sh", "-c", "java -Dserver.port=${PORT:-80} -jar /app/app.jar"]
