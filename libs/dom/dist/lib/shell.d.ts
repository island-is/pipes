interface Output {
    stdout: string;
    stderr: string;
    code: number;
}
declare class Shell {
    static execute(cmd: string, args: string[], options: {
        cwd?: string | undefined;
        env?: Record<string, string | undefined>;
    }): Promise<Output>;
}
export { Shell };
