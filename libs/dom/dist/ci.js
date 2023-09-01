/* eslint-disable @typescript-eslint/no-use-before-define */ import { EOL } from "node:os";
import ciinfo from "ci-info";
import terminalLink from "terminal-link";
import { Command } from "./github-command.js";
import { ANSI_BG_WHITE, ANSI_BLACK, ANSI_BLUE, ANSI_BOLD, ANSI_CYAN, ANSI_GREEN, ANSI_RED, ANSI_RESET, ANSI_YELLOW, DIALOG_STYLES, isListItem, isTableCell, isTableHeadings, isTableRow } from "./helpers.js";
const renderBorder = (width, part)=>{
    const paddedWidth = width + 4; // Additional 2 spaces for each side
    switch(part){
        case "top":
            return `┌${"─".repeat(paddedWidth)}┐`;
        case "middle":
            return `│${" ".repeat(paddedWidth)}│`;
        case "bottom":
            return `└${"─".repeat(paddedWidth)}┘`;
        default:
            return "";
    }
};
const ComponentRenderersANSI = {
    Mask: (component)=>{
        const values = (Array.isArray(component.values) ? component.values : [
            component.values
        ]).filter((e)=>typeof e === "string" && e.length > 1);
        if (ciinfo.GITHUB_ACTIONS) {
            return values.map((e)=>new Command("add-mask", {}, e).toString()).join("\n");
        }
        return "";
    },
    Group: (component)=>{
        const content = renderToANSIString(component.children);
        if (ciinfo.GITHUB_ACTIONS) {
            const startGroup = new Command("group", {}, component.title).toString();
            const endGroup = new Command("endgroup", {}, "").toString();
            return `\n${startGroup}\n${content}\n${endGroup}`;
        }
        return content;
    },
    Text: (component)=>{
        return component.value || "";
    },
    Link: (component)=>{
        return terminalLink(component.children, component.href);
    },
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
            return `${ANSI_RED}Invalid Date${ANSI_RESET}`;
        }
        const format = component.format || "ISO";
        let formattedDate;
        switch(format){
            case "STRING":
                formattedDate = date.toString();
                break;
            case "ISO":
                formattedDate = date.toISOString();
                break;
            case "Locale":
            default:
                formattedDate = date.toLocaleString();
                break;
        }
        return `${ANSI_BLUE}${formattedDate}${ANSI_RESET}`;
    },
    Container: (component)=>{
        if (Array.isArray(component.children)) {
            return `\n${component.children.map((child)=>renderToANSIString(child)).join("\n")}`;
        } else {
            return `\n${renderToANSIString(component.children)}`;
        }
    },
    Row: (component)=>{
        if ("children" in component) {
            if (Array.isArray(component.children)) {
                return `${component.children.map((child)=>renderToANSIString(child)).join("  ")}`;
            } else {
                return `\n${renderToANSIString(component.children)}`;
            }
        } else {
            return "";
        }
    },
    Success: (component)=>{
        return `\n✅ ${ANSI_GREEN}${renderToANSIString(component.children)}${ANSI_RESET}\n`;
    },
    Failure: (component)=>{
        return `\n❌ ${ANSI_RED}${renderToANSIString(component.children)}${ANSI_RESET}\n`;
    },
    Error: (component)=>{
        return `${ANSI_RED}${renderToANSIString(component.children)}${ANSI_RESET}`;
    },
    Info: (component)=>{
        return `${ANSI_CYAN}${renderToANSIString(component.children)}${ANSI_RESET}`;
    },
    Log: (component)=>{
        return renderToANSIString(component.children);
    },
    Title: (component)=>{
        return `${ANSI_BOLD}${renderToANSIString(component.children)}${ANSI_RESET}\n`;
    },
    Subtitle: (component)=>{
        return renderToANSIString(component.children);
    },
    List: (component)=>{
        if (Array.isArray(component.children)) {
            const children = component.children.filter((e)=>isListItem(e));
            return children.map((child)=>`- ${renderToANSIString(child)}`).join("\n");
        } else {
            if (isListItem(component.children)) {
                return `- ${renderToANSIString(component.children)}`;
            }
        }
        return "";
    },
    ListItem: (component)=>{
        return renderToANSIString(component.children);
    },
    Dialog: (component)=>{
        return Dialog(component);
    },
    Divider: (_component)=>{
        return "\n-----------------------------------\n";
    },
    Badge: (component)=>{
        return `[${renderToANSIString(component.children)}]`;
    },
    Note: (component)=>{
        const value = `${ANSI_CYAN}Note: ${renderToANSIString(component.children)}${ANSI_RESET}`;
        return value;
    },
    Warning: (component)=>{
        return `${ANSI_YELLOW}Warning: ${renderToANSIString(component.children)}${ANSI_RESET}`;
    },
    Highlight: (component)=>{
        return `${ANSI_BG_WHITE}${ANSI_BLACK}${renderToANSIString(component.children)}${ANSI_RESET}`;
    },
    Code: (component)=>{
        return renderToANSIString(component.children);
    },
    Fragment: (component)=>{
        if (Array.isArray(component.children)) {
            return component.children.map((child)=>renderToANSIString(child)).join("\n");
        } else {
            return renderToANSIString(component.children);
        }
    },
    Table: (component)=>{
        const TERMINAL_WIDTH = process.stdout.columns || 80;
        const components = [
            ...Array.isArray(component.children) ? component.children : [
                component.children
            ]
        ].filter((e)=>{
            return isTableHeadings(e) || isTableRow(e);
        });
        const maxColumns = components.reduce((max, row)=>{
            if (Array.isArray(row.children)) {
                return Math.max(max, row.children.length);
            }
            return max;
        }, 1);
        const maxColumnWidth = Math.floor(TERMINAL_WIDTH / maxColumns);
        return components.map((row)=>{
            const children = Array.isArray(row.children) ? row.children : [
                row.children
            ];
            const value = children.map((cell)=>{
                if (!isTableCell(cell)) {
                    return "";
                }
                const cellContent = renderToANSIString(cell) || "";
                const truncatedContent = cellContent.length > maxColumnWidth ? `${cellContent.substring(0, maxColumnWidth - 2)}…` : cellContent;
                return truncatedContent.padEnd(maxColumnWidth, " ");
            }).join("");
            if (row.type === "TableHeadings") {
                return `${ANSI_BOLD}${value}${ANSI_RESET}`;
            }
            return value;
        }).join("\n");
    },
    TableHeadings: (_component)=>{
        throw new Error("Should be never called directly");
    },
    TableRow: (_component)=>{
        throw new Error("Should be never called directly");
    },
    TableCell: (component)=>{
        return renderToANSIString(component.children);
    }
};
export const renderToANSIString = (component)=>{
    if (component === null || typeof component === "undefined") {
        return "";
    }
    if (typeof component === "string") {
        return component;
    }
    if (Array.isArray(component)) {
        return component.map((value)=>renderToANSIString(value)).join(" ");
    }
    if (!component || !("type" in component)) {
        return "";
    }
    if (ComponentRenderersANSI[component.type]) {
        return ComponentRenderersANSI[component.type](component);
    }
    throw new Error("Invalid type");
};
const Dialog = ({ dialogType = "default", message, paddingTop = 0, paddingBottom = 0 })=>{
    const style = DIALOG_STYLES[dialogType];
    const messageLines = (message || "").split("\n");
    const messageWidth = Math.max(...messageLines.map((line)=>line.length));
    const topBorder = renderBorder(messageWidth, "top");
    const bottomBorder = renderBorder(messageWidth, "bottom");
    const formattedMessageLines = messageLines.map((line)=>`│  ${line.padEnd(messageWidth, " ")}  │`).join("\n");
    const components = [
        style,
        topBorder,
        formattedMessageLines,
        bottomBorder,
        ANSI_RESET
    ];
    const formattedMessage = "\n".repeat(paddingTop) + components.join("\n") + "\n".repeat(paddingBottom);
    return formattedMessage.trim(); // This trims whitespace from the start and end of the string
};
export const renderToTerminal = (component)=>{
    process.stdout.write(renderToANSIString(component));
};
class ConsoleRender {
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
    #streamWrite = (chunk, stream = process.stdout, encoding = "utf-8")=>{
        return new Promise(async (resolve, reject)=>{
            await this.#lockRender(()=>{
                const errListener = (err)=>{
                    stream.removeListener("error", errListener);
                    reject(err);
                };
                stream.addListener("error", errListener);
                const callback = ()=>{
                    stream.removeListener("error", errListener);
                    resolve();
                };
                stream.write(chunk, encoding, callback);
            });
        });
    };
    #write = async ()=>{
        const lines = this.#string.split("\n");
        for (const line of lines){
            await this.#streamWrite(`${line}\n`);
        }
    };
    get lineCount() {
        if (!this.#string) return 0;
        const lines = this.#string.split("\n");
        const lineCount = lines.length - 1;
        return lineCount;
    }
    async #clear() {
        let clearLines = "\x1B[K";
        clearLines += "\x1B[1A\x1B[K".repeat(this.lineCount);
        await this.#streamWrite(clearLines);
    }
    mount(element) {
        this.#elements.push(element);
    }
    async mountAndRender(element) {
        this.#elements.splice(0, this.#elements.length);
        this.#elements.push(element);
        await this.render();
    }
    async render() {
        let string = "";
        for (const element of this.#elements){
            string += renderToANSIString(element);
        }
        this.#string = string.replace("\n", EOL);
        await this.#write();
    }
}
export const consoleRender = new ConsoleRender();
