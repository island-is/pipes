export declare const renderToMarkdownString: (component: JSX.Element | null) => string;
declare class SummaryRender {
    #private;
    get lineCount(): number;
    mount(element: JSX.Element): void;
    render(): Promise<void>;
}
export declare const summaryRender: SummaryRender;
export {};
