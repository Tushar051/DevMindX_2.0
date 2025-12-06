# 🐳 Docker Setup Guide for DevMindX IDE

## Why Docker is Needed

The Cursor IDE uses Docker to provide **secure, isolated code execution**. This means:
- Your code runs in a sandboxed environment
- No risk to your system
- Support for 10+ programming languages
- Consistent execution across all platforms

## Current Status

**Error Message:**
```
docker: error during connect: Head "http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine/_ping": 
open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified.
```

**What this means:** Docker Desktop is not running on your Windows machine.

## 🔧 Setup Instructions

### Step 1: Install Docker Desktop (if not installed)

1. **Download Docker Desktop for Windows**
   - Visit: https://www.docker.com/products/docker-desktop/
   - Click "Download for Windows"
   - Run the installer

2. **System Requirements**
   - Windows 10 64-bit: Pro, Enterprise, or Education (Build 19041 or higher)
   - OR Windows 11 64-bit
   - WSL 2 feature enabled
   - Virtualization enabled in BIOS

3. **Installation Steps**
   ```
   1. Run Docker Desktop Installer.exe
   2. Follow the installation wizard
   3. Enable WSL 2 when prompted
   4. Restart your computer if required
   ```

### Step 2: Start Docker Desktop

1. **Launch Docker Desktop**
   - Find Docker Desktop in Start Menu
   - Click to open
   - Wait for Docker to start (may take 1-2 minutes)

2. **Verify Docker is Running**
   - Look for Docker icon in system tray
   - Icon should be steady (not animated)
   - Hover over icon - should say "Docker Desktop is running"

3. **Test Docker from Command Line**
   ```bash
   # Open PowerShell or CMD
   docker --version
   # Should show: Docker version 24.x.x, build xxxxx
   
   docker ps
   # Should show: CONTAINER ID   IMAGE   COMMAND   CREATED   STATUS   PORTS   NAMES
   ```

### Step 3: Configure Docker (Optional)

1. **Open Docker Desktop Settings**
   - Click Docker icon in system tray
   - Select "Settings"

2. **Recommended Settings**
   - **Resources > Advanced**
     - CPUs: 2-4 (depending on your system)
     - Memory: 4-8 GB
     - Swap: 1 GB
   
   - **General**
     - ✅ Start Docker Desktop when you log in
     - ✅ Use WSL 2 based engine

3. **Apply & Restart**
   - Click "Apply & Restart"
   - Wait for Docker to restart

### Step 4: Pull Required Images

The IDE uses these Docker images for code execution:

#### Option 1: Automated Script (Recommended)

**Windows:**
```bash
# Navigate to DevMindX folder
cd DevMindX

# Run the batch script
pull-docker-images.bat
```

**Linux/Mac:**
```bash
# Navigate to DevMindX folder
cd DevMindX

# Make script executable
chmod +x pull-docker-images.sh

# Run the script
./pull-docker-images.sh
```

#### Option 2: Manual Pull

```bash
# Open PowerShell or CMD and run:

# For C/C++
docker pull gcc:12-alpine

# For Python
docker pull python:3.11-alpine

# For Node.js/JavaScript/TypeScript
docker pull node:20-alpine

# For Java
docker pull eclipse-temurin:17-jdk-alpine

# For Go
docker pull golang:1.21-alpine

# For Rust
docker pull rust:1.75-alpine

# For PHP
docker pull php:8.3-cli-alpine

# For Shell scripts
docker pull alpine:3.19
```

**Note:** The IDE will automatically pull these images when you first run code in each language, but pre-pulling them saves time and ensures everything works smoothly.

### Step 5: Test in DevMindX IDE

1. **Refresh the IDE page**
   - Press F5 or Ctrl+R
   - Docker status should show "🐳 Docker Ready"

2. **Create a test file**
   ```python
   # test.py
   print("Hello from Docker!")
   ```

3. **Click "Run Code"**
   - Should see output in terminal
   - No errors about Docker

## 🐛 Troubleshooting

### Issue 1: Docker Desktop won't start

**Symptoms:**
- Docker icon keeps animating
- Error: "Docker Desktop starting..."

**Solutions:**
1. **Enable Virtualization in BIOS**
   ```
   1. Restart computer
   2. Enter BIOS (usually F2, F10, or Del key)
   3. Find "Virtualization Technology" or "Intel VT-x"
   4. Enable it
   5. Save and exit
   ```

2. **Enable WSL 2**
   ```powershell
   # Run PowerShell as Administrator
   wsl --install
   wsl --set-default-version 2
   ```

3. **Update Windows**
   - Go to Settings > Update & Security
   - Install all available updates
   - Restart computer

### Issue 2: "WSL 2 installation is incomplete"

**Solution:**
```powershell
# Run PowerShell as Administrator
wsl --update
wsl --set-default-version 2
```

### Issue 3: Docker commands not found

**Solution:**
1. Restart PowerShell/CMD
2. Or add Docker to PATH:
   - Search "Environment Variables" in Windows
   - Edit PATH variable
   - Add: `C:\Program Files\Docker\Docker\resources\bin`

### Issue 4: Permission denied errors

**Solution:**
1. Run Docker Desktop as Administrator
2. Or add your user to "docker-users" group:
   ```
   1. Open "Computer Management"
   2. Go to "Local Users and Groups" > "Groups"
   3. Double-click "docker-users"
   4. Add your user account
   5. Log out and log back in
   ```

### Issue 5: Slow performance

**Solutions:**
1. Increase Docker resources (see Step 3)
2. Close unnecessary applications
3. Disable antivirus temporarily
4. Use WSL 2 backend (faster than Hyper-V)

## 🚀 Alternative: Use Without Docker

If you can't install Docker, you can still use the IDE for:

### ✅ What Works Without Docker
- File creation and editing
- Monaco Editor features
- Syntax highlighting
- IntelliSense and autocomplete
- AI code assistance
- Project management
- Saving and loading projects

### ❌ What Requires Docker
- Running code
- Testing programs
- Debugging
- Terminal output

### 💡 Alternatives for Code Execution
1. **Online Compilers**
   - Python: https://www.programiz.com/python-programming/online-compiler/
   - Java: https://www.onlinegdb.com/online_java_compiler
   - C++: https://www.onlinegdb.com/online_c++_compiler
   - JavaScript: https://jsfiddle.net/

2. **Local Installation**
   - Install Python, Node.js, Java, etc. directly
   - Run code in external terminal
   - Copy/paste from IDE

3. **Cloud IDEs**
   - Replit: https://replit.com/
   - CodeSandbox: https://codesandbox.io/
   - Gitpod: https://www.gitpod.io/

## 📊 Docker Status Indicators

### In the IDE

**🐳 Docker Ready** (Green)
- Docker is running
- Code execution available
- All features working

**🐳 Docker Offline** (Orange)
- Docker is not running
- Code execution disabled
- Other features still work

**No indicator**
- Checking Docker status...
- Please wait

## 🔐 Security Notes

### Why Docker is Secure

1. **Isolation**
   - Code runs in separate container
   - No access to your files
   - No access to network

2. **Resource Limits**
   - CPU: 1 core max
   - RAM: 256MB max
   - Processes: 300 max
   - Timeout: 30 seconds

3. **Read-Only**
   - Base filesystem is read-only
   - Only temp directory is writable
   - Auto-cleanup after execution

### What Docker Can't Do

- ❌ Access your personal files
- ❌ Install software on your system
- ❌ Make network requests
- ❌ Run indefinitely
- ❌ Use excessive resources

## 📝 Quick Reference

### Start Docker
```bash
# Windows: Click Docker Desktop icon
# Or from PowerShell:
& "C:\Program Files\Docker\Docker\Docker Desktop.exe"
```

### Check Docker Status
```bash
docker --version
docker ps
docker info
```

### Stop Docker
```bash
# Right-click Docker icon in system tray
# Select "Quit Docker Desktop"
```

### Restart Docker
```bash
# Stop Docker Desktop
# Wait 10 seconds
# Start Docker Desktop again
```

## 🎯 Success Checklist

- [ ] Docker Desktop installed
- [ ] Docker Desktop running
- [ ] Docker icon in system tray (steady)
- [ ] `docker --version` works in terminal
- [ ] `docker ps` shows no errors
- [ ] IDE shows "🐳 Docker Ready"
- [ ] Test code runs successfully
- [ ] No error messages in terminal

## 📞 Need Help?

### Resources
- Docker Documentation: https://docs.docker.com/desktop/windows/
- Docker Forums: https://forums.docker.com/
- Stack Overflow: https://stackoverflow.com/questions/tagged/docker

### Common Commands
```bash
# Check Docker version
docker --version

# List running containers
docker ps

# List all containers
docker ps -a

# List images
docker images

# Remove unused images
docker image prune

# Check Docker disk usage
docker system df

# Clean up everything
docker system prune -a
```

---

**Status**: Docker Required for Code Execution
**Platform**: Windows 10/11
**Docker Version**: 24.x or higher recommended
**Last Updated**: December 2, 2024
