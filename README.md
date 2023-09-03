# Pipes

**Pipes** is dev-friendly, testable pipelines library for local & CI/CD platforms, written in Typescript.

> ⚠️**Disclaimer**⚠️: This software is currently in development and is not considered production-ready. It more than likely contains bugs, incomplete features, or other discrepancies. **Use at your own risk**.
>
> It is strongly advised to NOT USE this software in a production environment or for critical applications until it has been thoroughly tested and deemed stable.

**Pipes** consist of:

- [**@island-is/pipes-core**](apps/pipes/) - Core of Pipes. Runs tasks with [dagger.io](https://dagger.io)

- [**@island.is/pipes-loader**](apps/pipes-loader/) - Node.js [loader](https://nodejs.org/api/esm.html#loaders) using [SWC](https://swc.rs/).

## 🧩 Modules

Pipes can be further extend with the usage of modules. Current modules are:

- [**@island-is/pipes-module-github**](pipes-modules/pipes-module-github/) - Working with GitHub.

- [**@island-is/pipes-module-node**](pipes-modules/pipes-module-node/) - Working with NodeJS apps.

- [**@island-is/pipes-module-terraform**](pipes-modules/pipes-module-terraform/) - Working with Terraform

## 🛡️ License

License is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
