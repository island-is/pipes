/**
 * A simple class to help with executing commands.
 */
import { spawn } from "child_process";

interface Output {
  stdout: string;
  stderr: string;
  code: number;
}

class Shell {
  /**
   * Execute a command and return the exit code.
   *
   * @param {string} cmd - The command to execute.
   * @param {Array<string>} args - The arguments for the command.
   * @param {{cwd?: string | undefined, env?: Record<string, string | undefined>}} options
   * @returns {Promise<number>} - Resolves with the exit code.
   */
  static execute(
    cmd: string,
    args: string[],
    options: { cwd?: string | undefined; env?: Record<string, string | undefined> },
  ): Promise<Output> {
    return new Promise((resolve, reject) => {
      const child = spawn(cmd, args, {
        env: options.env || undefined,
        cwd: options.cwd || undefined,
        shell: false,
      });
      let stdout = "";
      let stderr = "";
      // Listen to stdout and write data to the console sequentially.
      child.stdout.on("data", (data) => {
        stdout += data.toString();
        //process.stdout.write(data);
      });

      child.stderr.on("data", (data) => {
        stderr += data.toString();
        //process.stderr.write(data);
      });

      child.on("close", (code) => {
        resolve({
          stdout,
          stderr,
          code: code == null ? 0 : code,
        });
      });

      child.on("error", (error) => {
        reject(error);
      });
    });
  }
}

export { Shell };
