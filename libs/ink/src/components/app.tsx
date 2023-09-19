import { EventEmitter } from "node:events";

import React, { PureComponent, type ReactNode } from "react";

import ErrorOverview from "./error-overview.js";
import { WidthContext, getWidth } from "./width-context.js";

type State = {
  readonly error?: Error;
};

// Root component for all Ink apps
// It renders stdin and stdout contexts, so that children can access them if needed
// It also handles Ctrl+C exiting and cursor visibility
export default class App extends PureComponent<{ children: ReactNode }, State> {
  static displayName = "InternalApp";

  static getDerivedStateFromError(error: Error): { error: Error } {
    return { error };
  }

  override state = {
    isFocusEnabled: true,
    activeFocusId: undefined,
    focusables: [],
    error: undefined,
  };

  // Count how many components enabled raw mode to avoid disabling
  // raw mode until all components don't need it anymore
  rawModeEnabledCount = 0;
  // eslint-disable-next-line @typescript-eslint/naming-convention
  internal_eventEmitter = new EventEmitter();

  override render(): ReactNode {
    return (
      <WidthContext.Provider value={getWidth()}>
        {this.state.error ? <ErrorOverview error={this.state.error as Error} /> : this.props.children}
      </WidthContext.Provider>
    );
  }

  override componentDidMount(): void {}

  override componentWillUnmount(): void {}
}
