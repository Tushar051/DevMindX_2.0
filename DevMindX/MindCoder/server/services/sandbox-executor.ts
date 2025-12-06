import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const execAsync = promisify(exec);

interface ExecutionResult {
  output: string;
  error?: string;
  exitCode: number;
  executionTime: number;
}

interface LanguageConfig {
  image: string;
  command: (filename: string) => string;
  extension: string;
}

const languageConfigs: Record<string, LanguageConfig> = {
  cpp: {
    image: 'gcc:12-alpine',
    command: (filename) => `g++ ${filename} -o /tmp/out && /tmp/out`,
    extension: '.cpp'
  },
  c: {
    image: 'gcc:12-alpine',
    command: (filename) => `gcc ${filename} -o /tmp/out && /tmp/out`,
    extension: '.c'
  },
  python: {
    image: 'python:3.11-alpine',
    command: (filename) => `python ${filename}`,
    extension: '.py'
  },
  javascript: {
    image: 'node:20-alpine',
    command: (filename) => `node ${filename}`,
    extension: '.js'
  },
  typescript: {
    image: 'node:20-alpine',
    command: (filename) => `node ${filename}`,
    extension: '.ts'
  },
  java: {
    image: 'eclipse-temurin:17-jdk-alpine',
    command: (filename) => {
      const className = filename.replace('.java', '');
      return `cp ${filename} /tmp/ && cd /tmp && javac ${filename} && java ${className}`;
    },
    extension: '.java'
  },
  go: {
    image: 'golang:1.21-alpine',
    command: (filename) => `go run ${filename}`,
    extension: '.go'
  },
  rust: {
    image: 'rust:1.75-alpine',
    command: (filename) => `rustc ${filename} -o /tmp/out && /tmp/out`,
    extension: '.rs'
  },
  php: {
    image: 'php:8.3-cli-alpine',
    command: (filename) => `php ${filename}`,
    extension: '.php'
  },
  shell: {
    image: 'alpine:3.19',
    command: (filename) => `sh ${filename}`,
    extension: '.sh'
  }
};

export class SandboxExecutor {
  private tempDir: string;

  constructor() {
    this.tempDir = path.join(process.cwd(), 'temp-executions');
  }

  async initialize() {
    try {
      await fs.mkdir(this.tempDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create temp directory:', error);
    }
  }

  async executeCode(
    code: string,
    language: string,
    filename?: string,
    input?: string
  ): Promise<ExecutionResult> {
    const startTime = Date.now();
    const config = languageConfigs[language];

    if (!config) {
      return {
        output: '',
        error: `Unsupported language: ${language}`,
        exitCode: 1,
        executionTime: 0
      };
    }

    const executionId = uuidv4();
    const executionDir = path.join(this.tempDir, executionId);
    const actualFilename = filename || `main${config.extension}`;
    const filePath = path.join(executionDir, actualFilename);

    try {
      // Create execution directory
      await fs.mkdir(executionDir, { recursive: true });

      // Write code to file
      await fs.writeFile(filePath, code, 'utf-8');

      // Build Docker command with security constraints
      const dockerCommand = [
        'docker run',
        '--rm',                              // Auto-remove container
        '--cpus=1',                          // Limit to 1 CPU core
        '--memory=256m',                     // Limit RAM to 256MB
        '--pids-limit=300',                  // Prevent fork bombs
        '--network=none',                    // No network access
        '--read-only',                       // Read-only filesystem
        '--tmpfs /tmp:rw,noexec,nosuid,size=50m', // Writable temp with limits
        `-v "${executionDir}:/app:ro"`,     // Mount code as read-only
        `-w /app`,                           // Set working directory
        `--user 1000:1000`,                  // Run as non-root user
        `--security-opt=no-new-privileges`,  // Prevent privilege escalation
        config.image,
        'sh -c',
        `"${config.command(actualFilename)}"`
      ].join(' ');

      console.log('Executing:', dockerCommand);
      if (input) {
        console.log('With input:', input);
      }

      // Execute with timeout and optional stdin
      let stdout: string, stderr: string;
      
      if (input) {
        // Create input file for cross-platform compatibility
        const inputFilePath = path.join(executionDir, 'input.txt');
        await fs.writeFile(inputFilePath, input, 'utf-8');
        
        // Modify docker command to read from input file
        const dockerCommandWithInput = [
          'docker run',
          '--rm',
          '--cpus=1',
          '--memory=256m',
          '--pids-limit=300',
          '--network=none',
          '--read-only',
          '--tmpfs /tmp:rw,noexec,nosuid,size=50m',
          `-v "${executionDir}:/app:ro"`,
          `-w /app`,
          `--user 1000:1000`,
          `--security-opt=no-new-privileges`,
          config.image,
          'sh -c',
          `"${config.command(actualFilename)} < /app/input.txt"`
        ].join(' ');
        
        const result = await execAsync(dockerCommandWithInput, {
          timeout: 30000,
          maxBuffer: 1024 * 1024
        });
        stdout = result.stdout;
        stderr = result.stderr;
      } else {
        const result = await execAsync(dockerCommand, {
          timeout: 30000,
          maxBuffer: 1024 * 1024
        });
        stdout = result.stdout;
        stderr = result.stderr;
      }

      const executionTime = Date.now() - startTime;

      return {
        output: stdout || stderr || 'Execution completed with no output',
        error: stderr && !stdout ? stderr : undefined,
        exitCode: 0,
        executionTime
      };

    } catch (error: any) {
      const executionTime = Date.now() - startTime;
      
      let errorMessage = 'Execution failed';
      if (error.killed) {
        errorMessage = 'Execution timeout (30s limit exceeded)';
      } else if (error.stderr) {
        errorMessage = error.stderr;
      } else if (error.message) {
        errorMessage = error.message;
      }

      return {
        output: error.stdout || '',
        error: errorMessage,
        exitCode: error.code || 1,
        executionTime
      };

    } finally {
      // Cleanup: Remove execution directory
      try {
        await fs.rm(executionDir, { recursive: true, force: true });
      } catch (cleanupError) {
        console.error('Cleanup failed:', cleanupError);
      }
    }
  }

  async checkDockerAvailability(): Promise<boolean> {
    try {
      await execAsync('docker --version');
      return true;
    } catch {
      return false;
    }
  }

  async pullRequiredImages(): Promise<void> {
    console.log('Pulling required Docker images...');
    const images = [...new Set(Object.values(languageConfigs).map(c => c.image))];
    
    for (const image of images) {
      try {
        console.log(`Pulling ${image}...`);
        await execAsync(`docker pull ${image}`);
        console.log(`✓ ${image} ready`);
      } catch (error) {
        console.error(`Failed to pull ${image}:`, error);
      }
    }
  }
}

export const sandboxExecutor = new SandboxExecutor();
