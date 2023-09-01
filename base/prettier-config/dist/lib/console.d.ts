/**
 * PLEASE WE ARE GONNA REPLACE THIS
 */
/**
 * @file Console helpers
 * /
/**
 * @param {string} msg - Error message
 * @param {string} task - Info message
 * @param {string | null} projectName - Project name
 * @param {number} ms - ms
 */
export declare const reportError: (msg: string, task: string, projectName?: string | null, ms?: number) => void;
/**
 *
 * @param {string} msg - Info message
 * @param {string} task - Info message
 * @param {string | null} projectName - Project name
 */
export declare const reportInfo: (msg: string, task: string, projectName?: string | null) => void;
/**
 *
 * @param {string} msg - Success message
 * @param {string} task - Info message
 * @param {string | null} projectName - Project name
 * @param {number} ms - ms
 */
export declare const reportSuccess: (msg: string, task: string, projectName?: string | null, ms?: number) => void;
export declare class Reporter {
    #private;
    /**
     * @param {string | null} name - Name of project
     * @param {string} task - Task
     * @param {boolean} enableTime - enableTimer
     */
    constructor(name: string | null, task: string, enableTime?: boolean);
    /**
     *
     * @param {string} _msg - Info message
     */
    info(_msg: string): void;
    /**
     *
     * @param {string} msg - Error message
     */
    error(msg: string): void;
    /**
     *
     * @param {string} msg - Success message
     */
    success(msg: string): void;
}
