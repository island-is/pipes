/* eslint-disable prefer-template */ /* eslint-disable @typescript-eslint/no-use-before-define */ import { writeFile } from "node:fs/promises";
import { isTableHeadings, isTableRow } from "./helpers.js";
const MarkdownRenderers = {
    Mask: (_component)=>{
        return "";
    },
    Group: (component)=>{
        return renderToMarkdownString(component.children);
    },
    Text: (component)=>component.value || "",
    Link: (component)=>`[${component.children}](${component.href})`,
    Timestamp: (component)=>{
        let date;
        if (component.time) {
            if (typeof component.time === "string" || typeof component.time === "number") {
                date = new Date(component.time);
            } else {
                date = component.time;
            }
        } else {
            date = new Date();
        }
        if (isNaN(date.getTime())) {
            return `Invalid Date`;
        }
        const format = component.format || "ISO";
        switch(format){
            case "STRING":
                return date.toString();
            case "ISO":
                return date.toISOString();
            case "Locale":
            default:
                return date.toLocaleString();
        }
    },
    Container: (component)=>`\n\n${renderToMarkdownString(Array.isArray(component.children) ? component.children : [
            component.children
        ])}\n\n`,
    Row: (component)=>renderToMarkdownString("children" in component ? Array.isArray(component.children) ? component.children : [
            component.children
        ] : []),
    Success: (component)=>`\n✅ ${renderToMarkdownString(component.children)}\n`,
    Failure: (component)=>`\n❌ ${renderToMarkdownString(component.children)}\n`,
    Error: (component)=>`\n🔴 ${renderToMarkdownString(component.children)}\n`,
    Info: (component)=>`\nℹ️ ${renderToMarkdownString(component.children)}\n`,
    Log: (component)=>renderToMarkdownString(component.children),
    Title: (component)=>`\n# ${renderToMarkdownString(component.children)}\n`,
    Subtitle: (component)=>`\n## ${renderToMarkdownString(component.children)}\n`,
    List: (component)=>{
        const value = Array.isArray(component.children) ? component.children.map((child)=>`- ${renderToMarkdownString(child)}`).join("\n") : `- ${renderToMarkdownString(component.children)}`;
        return `\n\n${value}\n\n`;
    },
    ListItem: (component)=>renderToMarkdownString(component.children),
    Dialog: (component)=>{
        const msg = component.message.split("\n").map((e)=>`> ${e} \n`).join("\n");
        return `\n\n${msg}\n\n`;
    },
    Divider: (_component)=>"\n\n---\n\n",
    Badge: (component)=>`[${renderToMarkdownString(component.children)}]`,
    Note: (component)=>`\n\n> Note: ${renderToMarkdownString(component.children)}\n\n`,
    Warning: (component)=>`\n\n> Warning: ${renderToMarkdownString(component.children)}\n\n`,
    Highlight: (component)=>`**${renderToMarkdownString(component.children)}**`,
    Code: (component)=>`\`${renderToMarkdownString(component.children)}\``,
    Fragment: (component)=>renderToMarkdownString(Array.isArray(component.children) ? component.children : [
            component.children
        ]),
    Table: (component)=>{
        // Tables in Markdown are quite specific; here's a basic implementation
        let tableStr = "\n\n";
        if (Array.isArray(component.children)) {
            for (const child of component.children){
                if (isTableHeadings(child)) {
                    const children = Array.isArray(child.children) ? child.children : [
                        child.children
                    ];
                    tableStr += children.map((cell)=>`| ${renderToMarkdownString(cell)} `).join("|") + "|\n";
                    tableStr += children.map(()=>"|:---:").join("") + "|\n";
                } else if (isTableRow(child)) {
                    const children = Array.isArray(child.children) ? child.children : [
                        child.children
                    ];
                    tableStr += children.map((cell)=>`| ${renderToMarkdownString(cell)} `).join("|") + "|\n";
                }
            }
        }
        return tableStr + "\n\n";
    },
    TableCell: (component)=>{
        return component.children;
    }
};
export const renderToMarkdownString = (component)=>{
    if (component === null || typeof component === "undefined") {
        return "";
    }
    if (typeof component === "string") {
        return component;
    }
    if (Array.isArray(component)) {
        return component.map((value)=>renderToMarkdownString(value)).join(" ");
    }
    if (!component || !("type" in component)) {
        return "";
    }
    if (MarkdownRenderers[component.type]) {
        return MarkdownRenderers[component.type](component);
    }
    throw new Error("Invalid type");
};
class SummaryRender {
    #string = "";
    #TERMINAL_WIDTH = process.stdout.columns || 80;
    #clearStr = "\r\x1B[1B";
    #elements = [];
    #renderInProgress = false;
    #lockRender = async (fn)=>{
        await this.#waitForRenderLock();
        this.#renderInProgress = true;
        await fn();
        this.#renderInProgress = false;
    };
    #waitForRenderLock = ()=>{
        return new Promise((resolve)=>{
            const fn = ()=>{
                if (!this.#renderInProgress) {
                    resolve();
                    return;
                }
                setTimeout(fn, 50);
            };
            fn();
        });
    };
    #streamWrite = async (chunk, encoding = "utf-8")=>{
        await this.#lockRender(async ()=>{
            if (!process.env["GITHUB_STEP_SUMMARY"]) {
                return;
            }
            await writeFile(process.env["GITHUB_STEP_SUMMARY"], chunk, encoding);
        });
    };
    #write = async ()=>{
        await this.#streamWrite(this.#string);
    };
    get lineCount() {
        if (!this.#string) return 0;
        const lines = this.#string.split("\n");
        const lineCount = lines.length - 1;
        return lineCount;
    }
    mount(element) {
        this.#elements.push(element);
    }
    async render() {
        let string = "";
        for (const element of this.#elements){
            string += renderToMarkdownString(element);
        }
        this.#string = string;
        await this.#write();
    }
}
export const summaryRender = new SummaryRender();
