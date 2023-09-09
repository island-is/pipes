/* eslint-disable @typescript-eslint/explicit-module-boundary-types */

import { Fragment } from "./factory.js";

import type { PipeComponents } from "./factory.js";

const hasPropsChanged = (prevProps: PipeComponents, nextProps: PipeComponents) => {
  const prevKeys = Object.keys(prevProps || {}).filter((k) => k !== "children");
  const nextKeys = Object.keys(nextProps || {}).filter((k) => k !== "children");

  if (prevKeys.length !== nextKeys.length) {
    return true;
  }

  for (const key of nextKeys) {
    if ((prevProps || {})[key as keyof typeof prevProps] !== (nextProps || {})[key as keyof typeof nextProps]) {
      return true;
    }
  }

  return false;
};

const getChildren = (el: PipeComponents) => {
  if (typeof el !== "object") {
    return [];
  }
  if (!el) {
    return [];
  }
  if (!("children" in el)) {
    return [];
  }
  return Array.isArray(el.children) ? el.children : [el.children];
};

export const getDifferences = (next: PipeComponents, prev: PipeComponents): PipeComponents => {
  if (typeof next !== typeof prev) {
    return next;
  }
  if (next == null) {
    return null;
  }
  if (prev == null) {
    return next;
  }
  if (typeof next === "string" || typeof next === "number") {
    if (next !== prev) {
      return next;
    }
    return null;
  }
  if (typeof prev !== "object" || prev == null) {
    // This should not happen - only for typecheck
    return null;
  }
  if (next.type !== prev.type) {
    return next;
  }
  if (hasPropsChanged(next, prev)) {
    return next;
  }
  const nextChildren = getChildren(next);
  const prevChildren = getChildren(prev);
  const diffValues: PipeComponents[] = [];
  let renderChild = true;

  if (next.type === "TableRow") {
    renderChild = false;
  }
  for (let i = 0; i < nextChildren.length; i++) {
    if (typeof prevChildren[i] === "undefined") {
      const newValue = getDifferences(nextChildren[i], null);
      if (newValue) {
        if (renderChild) {
          diffValues.push(newValue);
        } else {
          return next;
        }
      }
    } else {
      const newValue = getDifferences(prevChildren[i], nextChildren[i]);
      if (newValue) {
        if (renderChild) {
          diffValues.push(newValue);
        } else {
          return next;
        }
      }
    }
  }
  if (diffValues.length === 0) {
    return null;
  }

  return Fragment({ children: diffValues as any }, diffValues as any);
};
