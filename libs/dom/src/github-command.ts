import type { AnnotationProperties } from "@actions/core";

export interface CommandProperties {
  [key: string]: any;
}

const CMD_STRING = "::";
export function toCommandValue(input: any): string {
  if (input === null || input === undefined) {
    return "";
  } else if (typeof input === "string" || input instanceof String) {
    return input as string;
  }
  return JSON.stringify(input);
}

/**
 *
 * @param annotationProperties
 * @returns The command properties to send with the actual annotation command
 */
export function toCommandProperties(annotationProperties: AnnotationProperties): CommandProperties {
  if (!Object.keys(annotationProperties).length) {
    return {};
  }

  return {
    title: annotationProperties.title,
    file: annotationProperties.file,
    line: annotationProperties.startLine,
    endLine: annotationProperties.endLine,
    col: annotationProperties.startColumn,
    endColumn: annotationProperties.endColumn,
  };
}
function escapeData(s: any): string {
  return toCommandValue(s).replace(/%/g, "%25").replace(/\r/g, "%0D").replace(/\n/g, "%0A");
}

function escapeProperty(s: any): string {
  return toCommandValue(s)
    .replace(/%/g, "%25")
    .replace(/\r/g, "%0D")
    .replace(/\n/g, "%0A")
    .replace(/:/g, "%3A")
    .replace(/,/g, "%2C");
}
export class Command {
  private readonly command: string;
  private readonly message: string;
  private readonly properties: CommandProperties;

  constructor(command: string, properties: CommandProperties, message: string) {
    if (!command) {
      command = "missing.command";
    }

    this.command = command;
    this.properties = properties;
    this.message = message;
  }

  toString(): string {
    let cmdStr = CMD_STRING + this.command;

    if (this.properties && Object.keys(this.properties).length > 0) {
      cmdStr += " ";
      let first = true;
      for (const key in this.properties) {
        if (this.properties.hasOwnProperty(key)) {
          const val = this.properties[key];
          if (val) {
            if (first) {
              first = false;
            } else {
              cmdStr += ",";
            }

            cmdStr += `${key}=${escapeProperty(val)}`;
          }
        }
      }
    }

    cmdStr += `${CMD_STRING}${escapeData(this.message)}`;
    return cmdStr;
  }
}
