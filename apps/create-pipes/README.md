# @island-is/create-pipes

**Usage**: Intended to be used as a custom loader in a Node.js environment with ES module support for usage with Pipes.

### Prerequisites

Create personal token with `write:packages` permission. Copy the token generated.

Insert into your your home directory (most likely /home/<USERNAME> on Unix and C:\Users<USERNAME> on windows) `.npmrc`

```yaml
//npm.pkg.github.com/:_authToken={YOUR_TOKEN}
@island-is:registry=https://npm.pkg.github.com/
```

> Note: This is only while pipes is in heavy testing.

### 🚀 Usage

```sh

npx @island-is/create-pipes example-app

```

This should create a new folder called `example-app`.

## 🛡️ License

License is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
