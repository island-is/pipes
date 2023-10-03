import React, { Fragment } from "react";

import Text from "../../ink/components/text.js";
import { maskString } from "../../ink/mask.js";
import { DOMError } from "../dom-error.js";

import { Error as PipesError } from "./error.js";

import type { ReactElement } from "react";
import ErrorOverview from "../../ink/components/error-overview.js";

interface Props {
  value: unknown;
  seen?: Set<unknown>;
  padding?: number;
}
export const PipesObject = (props: Props): ReactElement => {
  const padding = props.padding ?? 1;
  const seen = props.seen ?? new Set();
  const input = props.value;
  if (typeof input === "number") {
    const isNan = Number.isNaN(input);
    return (
      <>
        <Text color={"gray"}>[number]</Text>
        <Text color={isNan ? "red" : undefined}>{isNan ? "[invalid]" : maskString(input)}</Text>
      </>
    );
  }
  if (typeof input === "string") {
    const isEmpty = input.trim().length === 0;
    return (
      <>
        {" "}
        <Text color={"gray"}>[string]</Text>
        <Text color={isEmpty === true ? "red" : undefined}>{isEmpty ? "[empty]" : maskString(input)}</Text>
      </>
    );
  }
  if (typeof input === "boolean") {
    return (
      <Text bold={true} color={input ? "green" : "red"}>
        {input.toString()}
      </Text>
    );
  }
  if (typeof input === "symbol") {
    return <Text bold={true}>Symbol</Text>;
  }
  if (typeof input === "function") {
    return <Text bold={true}>Function</Text>;
  }
  if (typeof input === null) {
    return <Text bold={true}>null</Text>;
  }
  if (typeof input === undefined) {
    return <Text bold={true}>undefined</Text>;
  }
  if (typeof input === "object" && input !== null) {
    if (seen.has(input)) {
      return <Text bold={true}>[[Circular Reference]]</Text>;
    }
    if (input instanceof DOMError) {
      return input.get();
    }
    if (input instanceof Error) {
      return <ErrorOverview error={input} />;
    }
    seen.add(input);
    const noKeys = Object.keys(input).length === 0;
    return (
      <Fragment>
        <Text bold={true}>{Array.isArray(input) ? "Array" : "Object"}</Text>
        {noKeys ? <Text>[value]{JSON.stringify(input)}</Text> : <></>}
        {Object.keys(input).map((key, index) => {
          return (
            <Fragment key={index}>
              <Text>
                {"\n"}
                {"  ".repeat(padding + 1)}
                {maskString(key)}:
              </Text>
              <PipesObject value={input[key as keyof typeof input]} padding={padding + 1} seen={seen} />
            </Fragment>
          );
        })}
      </Fragment>
    );
  }
  return <Text bold={true}>{typeof input}</Text>;
};
