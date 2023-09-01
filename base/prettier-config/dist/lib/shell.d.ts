interface Output {
    stdout: string;
    stderr: string;
    code: number;
}
declare class Shell {
    /**
     * Execute a command and return the exit code.
     *
     * @param {string} cmd - The command to execute.
     * @param {Array<string>} args - The arguments for the command.
     * @param {{cwd?: string | undefined, env?: Record<string, string | undefined>}} options
     * @returns {Promise<number>} - Resolves with the exit code.
     */
    static execute(cmd: string, args: string[], options: {
        cwd?: string | undefined;
        env?: Record<string, string | undefined>;
    }): Promise<Output>;
}
export { Shell };
