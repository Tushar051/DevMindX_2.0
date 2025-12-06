# 🐳 Docker Images Reference

## Current Images Used by DevMindX IDE

### Updated: December 2, 2024

All images use Alpine Linux variants for smaller size and faster downloads.

## Image List

| Language | Docker Image | Size | Pull Command |
|----------|-------------|------|--------------|
| **C** | `gcc:12-alpine` | ~150MB | `docker pull gcc:12-alpine` |
| **C++** | `gcc:12-alpine` | ~150MB | `docker pull gcc:12-alpine` |
| **Python** | `python:3.11-alpine` | ~50MB | `docker pull python:3.11-alpine` |
| **JavaScript** | `node:20-alpine` | ~120MB | `docker pull node:20-alpine` |
| **TypeScript** | `node:20-alpine` | ~120MB | `docker pull node:20-alpine` |
| **Java** | `eclipse-temurin:17-jdk-alpine` | ~180MB | `docker pull eclipse-temurin:17-jdk-alpine` |
| **Go** | `golang:1.21-alpine` | ~300MB | `docker pull golang:1.21-alpine` |
| **Rust** | `rust:1.75-alpine` | ~600MB | `docker pull rust:1.75-alpine` |
| **PHP** | `php:8.3-cli-alpine` | ~80MB | `docker pull php:8.3-cli-alpine` |
| **Shell** | `alpine:3.19` | ~7MB | `docker pull alpine:3.19` |

## Total Download Size

**Approximate:** ~1.8 GB (all images)

## Quick Pull All

### Windows (PowerShell/CMD)
```bash
cd DevMindX
pull-docker-images.bat
```

### Linux/Mac (Bash)
```bash
cd DevMindX
chmod +x pull-docker-images.sh
./pull-docker-images.sh
```

### Manual (All Platforms)
```bash
docker pull gcc:12-alpine && \
docker pull python:3.11-alpine && \
docker pull node:20-alpine && \
docker pull eclipse-temurin:17-jdk-alpine && \
docker pull golang:1.21-alpine && \
docker pull rust:1.75-alpine && \
docker pull php:8.3-cli-alpine && \
docker pull alpine:3.19
```

## Why These Images?

### Alpine Linux Base
- **Smaller size**: 5-10x smaller than standard images
- **Faster downloads**: Less bandwidth required
- **Faster startup**: Containers start quicker
- **Security**: Minimal attack surface

### Specific Versions
- **Stability**: Pinned versions prevent breaking changes
- **Compatibility**: Tested and verified to work
- **Updates**: Will be updated periodically

## Image Details

### GCC (C/C++)
```
Image: gcc:12-alpine
Base: Alpine Linux 3.19
Compiler: GCC 12.x
Size: ~150MB
Features: C, C++, make, binutils
```

### Python
```
Image: python:3.11-alpine
Base: Alpine Linux 3.19
Version: Python 3.11.x
Size: ~50MB
Features: pip, standard library
```

### Node.js
```
Image: node:20-alpine
Base: Alpine Linux 3.19
Version: Node.js 20.x LTS
Size: ~120MB
Features: npm, node, JavaScript, TypeScript (via node)
```

### Java
```
Image: eclipse-temurin:17-jdk-alpine
Base: Alpine Linux 3.19
Version: Java 17 LTS
Size: ~180MB
Features: javac, java, JDK tools
Provider: Eclipse Adoptium (formerly AdoptOpenJDK)
```

### Go
```
Image: golang:1.21-alpine
Base: Alpine Linux 3.19
Version: Go 1.21.x
Size: ~300MB
Features: go compiler, standard library
```

### Rust
```
Image: rust:1.75-alpine
Base: Alpine Linux 3.19
Version: Rust 1.75.x
Size: ~600MB
Features: rustc, cargo, standard library
```

### PHP
```
Image: php:8.3-cli-alpine
Base: Alpine Linux 3.19
Version: PHP 8.3.x
Size: ~80MB
Features: php-cli, standard extensions
```

### Shell
```
Image: alpine:3.19
Base: Alpine Linux 3.19
Size: ~7MB
Features: sh, basic Unix utilities
```

## Verification

### Check Downloaded Images
```bash
docker images | grep -E "gcc|python|node|temurin|golang|rust|php|alpine"
```

### Test Each Image
```bash
# C/C++
docker run --rm gcc:12-alpine gcc --version

# Python
docker run --rm python:3.11-alpine python --version

# Node.js
docker run --rm node:20-alpine node --version

# Java
docker run --rm eclipse-temurin:17-jdk-alpine java -version

# Go
docker run --rm golang:1.21-alpine go version

# Rust
docker run --rm rust:1.75-alpine rustc --version

# PHP
docker run --rm php:8.3-cli-alpine php --version

# Shell
docker run --rm alpine:3.19 sh -c "echo 'Alpine Linux'"
```

## Troubleshooting

### Image Not Found
```bash
# Error: manifest for <image> not found

# Solution: Check image name spelling
docker pull <correct-image-name>
```

### Pull Timeout
```bash
# Error: timeout pulling image

# Solution: Check internet connection
# Or use Docker Hub mirror
docker pull --platform linux/amd64 <image-name>
```

### Disk Space
```bash
# Check Docker disk usage
docker system df

# Clean up unused images
docker image prune -a

# Remove specific image
docker rmi <image-name>
```

## Updates

### Check for Updates
```bash
# Pull latest versions
docker pull gcc:12-alpine
docker pull python:3.11-alpine
# ... etc
```

### Auto-Update Script
```bash
# Re-run the pull script
cd DevMindX
pull-docker-images.bat  # Windows
./pull-docker-images.sh # Linux/Mac
```

## Security

### Image Verification
All images are from official Docker Hub repositories:
- ✅ Official Docker images
- ✅ Verified publishers
- ✅ Regular security updates
- ✅ Community maintained

### Scanning
```bash
# Scan image for vulnerabilities (requires Docker Scout)
docker scout cves <image-name>
```

## Performance

### Startup Times
| Image | Cold Start | Warm Start |
|-------|-----------|------------|
| Alpine | <1s | <0.5s |
| Python | ~2s | ~1s |
| Node.js | ~2s | ~1s |
| Java | ~3s | ~1.5s |
| Go | ~2s | ~1s |
| Rust | ~3s | ~1.5s |
| GCC | ~2s | ~1s |
| PHP | ~2s | ~1s |

### Optimization Tips
1. Keep images pulled locally
2. Don't delete images between uses
3. Use `--rm` flag (already implemented)
4. Limit concurrent executions

## Migration Notes

### Old → New Images

| Old Image | New Image | Reason |
|-----------|-----------|--------|
| `openjdk:17-slim` | `eclipse-temurin:17-jdk-alpine` | OpenJDK deprecated, smaller size |
| `gcc:latest` | `gcc:12-alpine` | Pinned version, smaller size |
| `python:3.11-slim` | `python:3.11-alpine` | Smaller size |
| `node:18-alpine` | `node:20-alpine` | Newer LTS version |
| `rust:latest` | `rust:1.75-alpine` | Pinned version, smaller size |
| `php:8.2-cli-alpine` | `php:8.3-cli-alpine` | Newer version |

---

**Last Updated**: December 2, 2024  
**Total Images**: 8 (10 languages)  
**Total Size**: ~1.8 GB  
**Platform**: linux/amd64, linux/arm64
