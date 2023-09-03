# @island.is/create-pipes

**Usage**: Intended to be used as a custom loader in a Node.js environment with ES module support for usage with Pipes.

### Prequsites

Insert into your your home directory (most likely /home/<USERNAME> on Unix and C:\Users<USERNAME> on windows) `.yarnrc.yml`

```yaml
npmScopes: { island.is: { npmRegistryServer: "https://npm.pkg.github.com" } }
```

> Note: This is only while pipes is in heavy testing.

### 🚀 Usage

```sh

yarn create @island.is/pipes example-app

```

This should create a new folder called `example-app`.

## 🛡️ License

License is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
