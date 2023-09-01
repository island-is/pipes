import type { AnnotationProperties } from "@actions/core";
export interface CommandProperties {
    [key: string]: any;
}
export declare function toCommandValue(input: any): string;
export declare function toCommandProperties(annotationProperties: AnnotationProperties): CommandProperties;
export declare class Command {
    private readonly command;
    private readonly message;
    private readonly properties;
    constructor(command: string, properties: CommandProperties, message: string);
    toString(): string;
}
