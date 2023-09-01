import { spawn } from "node:child_process";

export const runScript = (cwd: string | null, arg: string, args: string[] = []): Promise<boolean> => {
  return new Promise<boolean>((resolve, reject) => {
    const child = spawn(arg, args, {
      env: process.env,
      cwd: cwd || process.cwd(),
      stdio: "pipe",
    });
    child.stdout.pipe(process.stdout);
    child.stderr.pipe(process.stderr);
    child.on("close", (_code) => {
      resolve(_code == null ? true : _code === 0 ? true : false);
    });

    child.on("error", (error) => {
      reject(error);
    });
  });
};
