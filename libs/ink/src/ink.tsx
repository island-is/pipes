import process from "node:process";

import autoBind from "auto-bind";
import originalIsCi from "is-ci";
import throttle from "lodash/throttle.js";
import { type IReactionDisposer, autorun, observable, runInAction } from "mobx";
import { type ReactNode } from "react";
import React from "react";
import { type FiberRoot } from "react-reconciler";
import Yoga from "yoga-wasm-web/auto";

import App from "./components/app.js";
import { getWidth } from "./components/width-context.js";
import * as dom from "./dom.js";
import reconciler from "./reconciler.js";
import render from "./renderer.js";
import { WriteTo } from "./write-to.js";

const isCi = process.env["CI"] === "false" ? false : originalIsCi;
const noop = () => {};

const _THROTTLE_MS = 500;
type RenderValue = ReactNode;
type ValueOrPromise<T> = T | Promise<T>;
type FnOrValue<T> = T | (() => T);
type RenderValueParam = FnOrValue<ValueOrPromise<RenderValue>>;

export default class Ink {
  // Ignore last render after unmounting a tree to prevent empty output before exit
  #isUnmounted: boolean;
  readonly #container: FiberRoot;
  #rootNode: dom.DOMElement;
  #_renderCB = () => {};
  #renderCB = () => {
    this.#_renderCB();
  };
  #rec = reconciler(this.#renderCB);
  readonly #unsubscribeResize?: () => void;

  constructor(public toString: boolean) {
    autoBind(this);

    this.#rootNode = dom.createNode("ink-root");
    this.#rootNode.onComputeLayout = this.calculateLayout;

    // Ignore last render after unmounting a tree to prevent empty output before exit
    this.#isUnmounted = false;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.#container = this.#rec.createContainer(
      this.#rootNode,
      // Legacy mode
      0,
      null,
      false,
      null,
      "id",
      () => {},
      null,
    );

    if (!isCi) {
      process.stdout.on("resize", this.resized);

      this.#unsubscribeResize = () => {
        process.stdout.off("resize", this.resized);
      };
    }
  }

  resized = (): void => {
    this.calculateLayout();
  };
  #autorunDispenser: IReactionDisposer | null = null;
  #getRenderedOutput(): string {
    return render(this.#rootNode);
  }

  prevValues: string = "";
  #setupAutorun(fn: RenderValueParam) {
    if (this.#autorunDispenser) {
      this.#autorunDispenser();
    }
    const updateStore = observable({ value: "" });
    const forceUpdate = () =>
      runInAction(() => {
        updateStore.value = this.#getRenderedOutput();
      });
    this.#_renderCB = forceUpdate;
    const update = throttle(
      async (value: string) => {
        if (this.#isUnmounted) {
          return;
        }
        if (value !== this.prevValues) {
          this.prevValues = value;
          if (!this.toString) {
            await WriteTo.lock((write) => {
              write(`\n${value}\n`, "stdout");
            });
          }
        }
      },
      _THROTTLE_MS,
      {
        leading: true,
        trailing: true,
      },
    );
    this.#autorunDispenser = autorun(async () => {
      updateStore.value;
      const nodeValue = await (() => {
        if (typeof fn === "function") {
          return fn();
        }
        return fn;
      })();
      const node = <App>{nodeValue}</App>;

      this.#rec.updateContainer(node, this.#container, null, noop);

      const value = this.#getRenderedOutput();
      await update(value);
    });
  }

  calculateLayout = (): void => {
    // The 'columns' property can be undefined or 0 when not using a TTY.
    // In that case we fall back to 80.
    const terminalWidth = getWidth();

    this.#rootNode.yogaNode!.setWidth(terminalWidth);

    this.#rootNode.yogaNode!.calculateLayout(undefined, undefined, Yoga.DIRECTION_LTR);
  };

  async render(node: RenderValueParam, now = false): Promise<void> {
    if (now) {
      const x = await (typeof node === "function" ? node() : node);
      this.#rec.updateContainer(x, this.#container, null, noop);
      const value = this.#getRenderedOutput();
      if (!this.toString) {
        await WriteTo.lock((write) => {
          write(`\n${value}\n`, "stdout");
        });
      }
      return;
    }
    if (this.#autorunDispenser) {
      const x = await (typeof node === "function" ? node() : node);
      this.#rec.updateContainer(x, this.#container, null, noop);
      return;
    }
    this.#setupAutorun(node);
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  unmount(_error?: Error | number | null): void {
    if (this.#isUnmounted) {
      return;
    }

    this.calculateLayout();
    if (this.#autorunDispenser) {
      this.#autorunDispenser();
    }
    if (typeof this.#unsubscribeResize === "function") {
      this.#unsubscribeResize();
    }

    this.#isUnmounted = true;

    this.#rec.updateContainer(null, this.#container, null, noop);
  }
}
