# Pipes

**Pipes** is dev-friendly, testable pipelines library for local & CI/CD platforms, written in Typescript.

**Pipes** consist of:

- [**@island-is/pipes-core**](apps/pipes/) - Core of Pipes. Runs tasks with [dagger.io](https://dagger.io)

- [**@island.is/fast-ts-loader**](libs/fast-ts-loader/) - Node.js [loader](https://nodejs.org/api/esm.html#loaders) using [SWC](https://swc.rs/).

## Modules

Pipes can be further extend with the usage of modules. Current modules are:

- [**@island-is/pipes-module-github**](pipes-modules/pipes-module-github/) - Working with GitHub.

- [**@island-is/pipes-module-node**](pipes-modules/pipes-module-node/) - Working with NodeJS apps.

- [**@island-is/pipes-module-terraform**](pipes-modules/pipes-module-terraform/) - Working with Terraform
