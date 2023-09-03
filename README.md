# Pipes

**Pipes** is dev-friendly, testable pipelines library for local & CI/CD platforms, written in Typescript.

> ⚠️**Disclaimer**⚠️: This software is currently in development and is not considered production-ready. It more than likely contains bugs, incomplete features, or other discrepancies. **Use at your own risk**.
>
> It is strongly advised to NOT USE this software in a production environment or for critical applications until it has been thoroughly tested and deemed stable.

**Pipes** consist of:

- [**@island-is/pipes-core**](apps/pipes/) - Core of Pipes. Runs tasks with [dagger.io](https://dagger.io)

- [**@island.is/pipes-loader**](apps/pipes-loader/) - Node.js [loader](https://nodejs.org/api/esm.html#loaders) using [SWC](https://swc.rs/).

- [**@island.is/create-pipes**](apps/create-pipes/) - Utility to create a boilerplate for a new CI project.

## Prerequisites

Before getting started with **Pipes**, ensure you have the following setup:

- **Docker or Podman**: These are essential for creating isolated environments, ensuring that software runs uniformly across different platforms.

  - Install [Docker](https://docs.docker.com/get-docker/) or [Podman](https://podman.io/getting-started/installation).
  - Check installation:
    ```bash
    docker --version
    # or
    podman --version
    ```

- **Node.js 20.5.0**: We're specifically targeting version 20.5.0 to ensure compatibility and smooth operations.
  - Install [Node.js](https://nodejs.org/en/).
  - We recommend using [nvm](https://github.com/nvm-sh/nvm) to easily switch between Node.js versions. Here's a guide on [how to set it up](https://github.com/nvm-sh/nvm#installing-and-updating).
  - Check installation and version:
    ```bash
    node --version
    ```
- **Yarn** When using Node.js 20 you only need to enable [corepack](https://nodejs.org/dist/latest/docs/api/corepack.html):
  ```bash
  corepack enable
  ```

After setting up the above prerequisites, you're ready to dive into **Pipes**!

## Installation

Insert into your your home directory (most likely /home/<USERNAME> on Unix and C:\Users<USERNAME> on windows) `.yarnrc.yml`

```yaml
npmScopes: { island.is: { npmRegistryServer: "https://npm.pkg.github.com" } }
```

> Note: This is only while pipes is in heavy testing.

```sh

yarn create @island.is/pipes example-app

```

This should create a new folder called `example-app`.

## 🧩 Modules

Pipes can be further extend with the usage of modules. Current modules are:

- [**@island-is/pipes-module-github**](pipes-modules/pipes-module-github/) - Working with GitHub.

- [**@island-is/pipes-module-node**](pipes-modules/pipes-module-node/) - Working with NodeJS apps.

- [**@island-is/pipes-module-terraform**](pipes-modules/pipes-module-terraform/) - Working with Terraform

## 🛡️ License

License is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
