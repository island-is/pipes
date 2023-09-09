import { consoleRender } from "./ci.js";
import { PipesDOM } from "./dom.js";

const summary = (
  <PipesDOM.Container>
    <PipesDOM.Title>Wow</PipesDOM.Title>
    <PipesDOM.Table>
      <PipesDOM.TableHeadings>
        <PipesDOM.TableCell>Metric</PipesDOM.TableCell>
        <PipesDOM.TableCell>Value</PipesDOM.TableCell>
        <PipesDOM.TableCell>Change since last month</PipesDOM.TableCell>
      </PipesDOM.TableHeadings>
    </PipesDOM.Table>
  </PipesDOM.Container>
);
