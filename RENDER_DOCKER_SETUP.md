# Render Docker Setup for Spring Boot

## ✅ Select "Docker" from Language Dropdown

When creating your web service on Render:
1. **Language:** Select **"Docker"**
2. Render will auto-detect your Dockerfile
3. Or configure build commands manually

## Option 1: Using Dockerfile (Recommended)

### Create Dockerfile in your backend root (`buygreen/`)

Create a file named `Dockerfile`:

```dockerfile
# Use OpenJDK 21
FROM eclipse-temurin:21-jdk-alpine

# Set working directory
WORKDIR /app

# Copy Maven wrapper and pom.xml
COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .

# Copy source code
COPY src ./src

# Build the application
RUN ./mvnw clean package -DskipTests

# Expose port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "target/buygreen-0.0.1-SNAPSHOT.jar"]
```

### Render Configuration:
- **Language:** Docker
- **Build Command:** (auto-detected from Dockerfile)
- **Start Command:** (auto-detected from Dockerfile)

## Option 2: Manual Configuration (No Dockerfile)

If you don't want to use Dockerfile:

### Render Configuration:
- **Language:** Docker
- **Build Command:** `./mvnw clean package -DskipTests`
- **Start Command:** `java -jar target/buygreen-0.0.1-SNAPSHOT.jar`

**Note:** You'll need to ensure Java 21 is available in the environment.

## Option 3: Use Render's Java Support (Alternative)

If Render supports Java directly in newer versions:
- Check if "Java" appears in the dropdown
- If yes, select "Java" instead
- Configure build and start commands

## Recommended: Use Dockerfile

**Why Docker?**
- ✅ Consistent environment
- ✅ Easy to configure
- ✅ Works reliably on Render
- ✅ Can specify exact Java version

## Quick Steps:

1. **Select "Docker"** from Language dropdown
2. **Create Dockerfile** (see above) in `buygreen/` folder
3. **Commit to GitHub**
4. **Render will auto-detect** and build
5. **Add environment variables**
6. **Deploy**

---

**Summary: Select "Docker" for your Spring Boot application!**

