@echo off
echo ========================================
echo  Pulling Docker Images for DevMindX IDE
echo ========================================
echo.

echo [1/10] Pulling GCC (C/C++)...
docker pull gcc:12-alpine
echo.

echo [2/10] Pulling Python...
docker pull python:3.11-alpine
echo.

echo [3/10] Pulling Node.js (JavaScript/TypeScript)...
docker pull node:20-alpine
echo.

echo [4/10] Pulling Java...
docker pull eclipse-temurin:17-jdk-alpine
echo.

echo [5/10] Pulling Go...
docker pull golang:1.21-alpine
echo.

echo [6/10] Pulling Rust...
docker pull rust:1.75-alpine
echo.

echo [7/10] Pulling PHP...
docker pull php:8.3-cli-alpine
echo.

echo [8/10] Pulling Alpine (Shell scripts)...
docker pull alpine:3.19
echo.

echo ========================================
echo  All images pulled successfully!
echo ========================================
echo.
echo You can now run code in the IDE.
echo.
pause
