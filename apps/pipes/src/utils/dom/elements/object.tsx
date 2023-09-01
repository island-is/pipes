import React, { Fragment } from "react";

import Text from "../../ink/components/text.js";
import { Box } from "../../ink/index.js";
import { maskString } from "../../ink/mask.js";
import { generateRandomString } from "../../zod/random.js";
import { DOMError } from "../dom-error.js";

import type { ReactElement } from "react";

interface Props {
  value: unknown;
  seen?: Set<unknown>;
  padding?: number;
  preKey?: string;
}
export const PipesObject = (props: Props): ReactElement => {
  const padding = props.padding ?? 1;
  const preKey = props.preKey ?? "";
  const seen = props.seen ?? new Set();
  const input = props.value;
  if (typeof input === "number") {
    const isNan = Number.isNaN(input);
    return (
      <Fragment key={generateRandomString()}>
        <Text color={"gray"}>[number]</Text>
        <Text color={isNan ? "red" : undefined}>{isNan ? "[invalid]" : maskString(input)}</Text>
      </Fragment>
    );
  }
  if (typeof input === "string") {
    const isEmpty = input.trim().length === 0;
    return (
      <Text key={generateRandomString()} color={isEmpty === true ? "red" : undefined}>
        {isEmpty ? "[empty]" : maskString(input)}
      </Text>
    );
  }
  if (typeof input === "boolean") {
    return (
      <Text bold={true} key={generateRandomString()} color={input ? "green" : "red"}>
        {input.toString()}
      </Text>
    );
  }
  if (typeof input === "symbol") {
    return (
      <Text bold={true} key={generateRandomString()}>
        Symbol
      </Text>
    );
  }
  if (typeof input === "function") {
    return (
      <Text bold={true} key={generateRandomString()}>
        Function
      </Text>
    );
  }
  if (typeof input === null) {
    return (
      <Text bold={true} key={generateRandomString()}>
        null
      </Text>
    );
  }
  if (typeof input === undefined) {
    return (
      <Text bold={true} key={generateRandomString()}>
        undefined
      </Text>
    );
  }
  if (typeof input === "object" && input !== null) {
    if (seen.has(input)) {
      return (
        <Box width={"100%"}>
          <Text bold={true} key={generateRandomString()}>
            [[Circular Reference]]
          </Text>
        </Box>
      );
    }
    if (input instanceof DOMError) {
      return input.get();
    }
    if (input instanceof Error) {
      console.error(input);
      return (
        <Text color="red" key={generateRandomString()}>
          {input.toString()}
        </Text>
      );
    }

    seen.add(input);
    const noKeys = Object.keys(input).length === 0;
    return (
      <Box flexDirection={"column"} key={generateRandomString()}>
        <Text bold={true}>{Array.isArray(input) ? "Array" : "Object"}</Text>
        {noKeys ? <Text>[object]{JSON.stringify(input)}</Text> : <></>}
        {noKeys ? (
          <></>
        ) : (
          Object.keys(input).map((key, index) => {
            return (
              <Fragment key={index}>
                <Text color="green">
                  {preKey}
                  {maskString(key)}:{" "}
                </Text>
                <PipesObject
                  value={input[key as keyof typeof input]}
                  preKey={`${preKey}${key}.`}
                  padding={padding + 1}
                  seen={seen}
                />
              </Fragment>
            );
          })
        )}
      </Box>
    );
  }
  return (
    <Box width={"100%"} key={generateRandomString()}>
      <Text bold={true}>{typeof input}</Text>
    </Box>
  );
};
