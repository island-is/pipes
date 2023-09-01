import { consoleRender } from "./ci.js";
import { PipesDOM } from "./dom.js";
import { summaryRender } from "./markdown.js";

const dashboard2 = (
  <PipesDOM.Group title="Test">
    <PipesDOM.Mask values={["Dashboard"]} />
    <PipesDOM.Container>
      <PipesDOM.Highlight>Note: User feedback will be available tomorrow.</PipesDOM.Highlight>
      <PipesDOM.Dialog dialogType="error" message="There was an error processing your request. WOWOWOWOW!" />
      <PipesDOM.Title>Dashboard Overview</PipesDOM.Title>
      <PipesDOM.Subtitle>Metrics for August 2023</PipesDOM.Subtitle>
      <PipesDOM.Success>Data fetched successfully!</PipesDOM.Success>
      <PipesDOM.Timestamp time={"12.22.2020"} />
      <PipesDOM.Failure>Failed fetching data!</PipesDOM.Failure>
      <PipesDOM.Warning>There was a slight discrepancy in the financial data. Please review.</PipesDOM.Warning>
      <PipesDOM.Table>
        <PipesDOM.TableHeadings>
          <PipesDOM.TableCell>Metric</PipesDOM.TableCell>
          <PipesDOM.TableCell>Value</PipesDOM.TableCell>
          <PipesDOM.TableCell>Change since last month</PipesDOM.TableCell>
        </PipesDOM.TableHeadings>
        <PipesDOM.TableRow>
          <PipesDOM.TableCell>Users</PipesDOM.TableCell>
          <PipesDOM.TableCell>4,500</PipesDOM.TableCell>
          <PipesDOM.TableCell>+15%</PipesDOM.TableCell>
        </PipesDOM.TableRow>
        <PipesDOM.TableRow>
          <PipesDOM.TableCell>Revenue</PipesDOM.TableCell>
          <PipesDOM.TableCell>$12,000</PipesDOM.TableCell>
          <PipesDOM.TableCell>-2%</PipesDOM.TableCell>
        </PipesDOM.TableRow>
        <PipesDOM.TableRow>
          <PipesDOM.TableCell>Subscriptions</PipesDOM.TableCell>
          <PipesDOM.TableCell>2,000</PipesDOM.TableCell>
          <PipesDOM.TableCell>+8%</PipesDOM.TableCell>
        </PipesDOM.TableRow>
      </PipesDOM.Table>
      <PipesDOM.List>
        <PipesDOM.ListItem>Tasks completed: 75</PipesDOM.ListItem>
        <PipesDOM.ListItem>Pending tasks: 12</PipesDOM.ListItem>
        <PipesDOM.ListItem>Overdue tasks: 3</PipesDOM.ListItem>
      </PipesDOM.List>
      <PipesDOM.Error>Failed to fetch advertisement data. Please check the ad server.</PipesDOM.Error>
      <PipesDOM.Highlight>Note: User feedback will be available tomorrow.</PipesDOM.Highlight>
      <PipesDOM.Divider />
      <PipesDOM.Link href="https://www.mbl.is">mbl.is</PipesDOM.Link>
      <PipesDOM.Row>
        <PipesDOM.Badge>Admin</PipesDOM.Badge>
        <PipesDOM.Text value="Logged in as: JohnDoe" />
      </PipesDOM.Row>
    </PipesDOM.Container>
  </PipesDOM.Group>
);

const summary = (
  <PipesDOM.Container>
    <PipesDOM.Title>Wow</PipesDOM.Title>
    <PipesDOM.Table>
      <PipesDOM.TableHeadings>
        <PipesDOM.TableCell>Metric</PipesDOM.TableCell>
        <PipesDOM.TableCell>Value</PipesDOM.TableCell>
        <PipesDOM.TableCell>Change since last month</PipesDOM.TableCell>
      </PipesDOM.TableHeadings>
      <PipesDOM.TableRow>
        <PipesDOM.TableCell>Users</PipesDOM.TableCell>
        <PipesDOM.TableCell>4,500</PipesDOM.TableCell>
        <PipesDOM.TableCell>+15%</PipesDOM.TableCell>
      </PipesDOM.TableRow>
      <PipesDOM.TableRow>
        <PipesDOM.TableCell>Revenue</PipesDOM.TableCell>
        <PipesDOM.TableCell>$12,000</PipesDOM.TableCell>
        <PipesDOM.TableCell>-2%</PipesDOM.TableCell>
      </PipesDOM.TableRow>
      <PipesDOM.TableRow>
        <PipesDOM.TableCell>Subscriptions</PipesDOM.TableCell>
        <PipesDOM.TableCell>2,000</PipesDOM.TableCell>
        <PipesDOM.TableCell>+8%</PipesDOM.TableCell>
      </PipesDOM.TableRow>
    </PipesDOM.Table>
  </PipesDOM.Container>
);

// Now you can use this to render to the terminal:
consoleRender.mount(dashboard2);
await consoleRender.render();
summaryRender.mount(summary);
await summaryRender.render();
