export declare const renderToANSIString: (component: JSX.Element | null) => string;
export declare const renderToTerminal: (component: JSX.Element) => void;
declare class ConsoleRender {
    #private;
    get lineCount(): number;
    mount(element: JSX.Element): void;
    mountAndRender(element: JSX.Element): Promise<void>;
    render(): Promise<void>;
}
export declare const consoleRender: ConsoleRender;
export {};
