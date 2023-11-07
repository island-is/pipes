# Pipes
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-2-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

**Pipes** is dev-friendly, testable pipelines library for local & CI/CD platforms, written in Typescript.

> ⚠️**Disclaimer**⚠️: This software is currently in development and is not considered production-ready. It more than likely contains bugs, incomplete features, or other discrepancies. **Use at your own risk**.
>
> It is strongly advised to NOT USE this software in a production environment or for critical applications until it has been thoroughly tested and deemed stable.

**Pipes** consist of:

- [**@island.is/pipes-core**](apps/pipes/) - Core of Pipes. Runs tasks with [dagger.io](https://dagger.io)

- [**@island.is/create-pipes**](apps/create-pipes/) - Utility to bootstrap a new CI project.

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

  while in a directory of a Pipe project.

After setting up the above prerequisites, you're ready to dive into **Pipes**!

## Installation

Create personal token with `write:packages` permission. Copy the token generated.

Insert into your your home directory (most likely /home/<USERNAME> on Unix and C:\Users<USERNAME> on windows) `.npmrc`

```yaml
//npm.pkg.github.com/:_authToken={YOUR_TOKEN}
@island.is:registry=https://npm.pkg.github.com/
```

> Note: This is only while pipes is in heavy testing.

```sh

npx @island.is/create-pipes example-app

```

This should create a new folder called `example-app`.

## 🧩 Modules

Pipes can be further extend with the usage of modules. Current modules are:

- [**@island.is/pipes-module-github**](pipes-modules/pipes-module-github/) - Working with GitHub.

- [**@island.is/pipes-module-node**](pipes-modules/pipes-module-node/) - Working with NodeJS apps.

- [**@island.is/pipes-module-terraform**](pipes-modules/pipes-module-terraform/) - Working with Terraform

## 🛡️ License

License is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/lodmfjord"><img src="https://avatars.githubusercontent.com/u/5091589?v=4?s=100" width="100px;" alt="lommi"/><br /><sub><b>lommi</b></sub></a><br /><a href="#maintenance-lodmfjord" title="Maintenance">🚧</a> <a href="https://github.com/island-is/pipes/commits?author=lodmfjord" title="Code">💻</a></td>
      <td align="center" valign="top" width="14.28%"><a href="http://github.com/busla"><img src="https://avatars.githubusercontent.com/u/3162968?v=4?s=100" width="100px;" alt="Jón Levy"/><br /><sub><b>Jón Levy</b></sub></a><br /><a href="#projectManagement-busla" title="Project Management">📆</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!