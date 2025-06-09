![Project banner](./images/banner.png)

[![Node.js](https://img.shields.io/badge/node.js-22.13.1-5FA04E?logo=nodedotjs&style=for-the-badge&logoColor=white)](https://nodejs.org/)
[![npm](https://img.shields.io/badge/npm-11.4.1-CB3837?logo=npm&style=for-the-badge&logoColor=white)](https://nodejs.org/)
[![Electron](https://img.shields.io/badge/electron-36.4.0-47848F?logo=electron&style=for-the-badge&logoColor=white)](https://www.electronjs.org/)
[![Electron Forge](https://img.shields.io/badge/electron--forge-7.8.0-6aa4b4?logo=electron&style=for-the-badge&logoColor=white)](https://www.electronforge.io/)
[![R](https://img.shields.io/badge/R-4.5.0-276DC3?logo=R&style=for-the-badge&logoColor=white)](https://www.r-project.org/)
[![pak](https://img.shields.io/badge/pak-0.9.0-1E90FF?style=for-the-badge&logoColor=white)](https://pak.r-lib.org/)

# nhyris

The minimal framework for transform R shiny application into standalone

## Prerequisites

Before installing **nhyris**, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v22.13.1 or higher recommended)
- [npm](https://www.npmjs.com/) (v11.4.1 or higher recommended)

You can check your versions with:

```sh
node -v
npm -v
```

## How to install

You can install nhyris globally using npm:

```sh
npm i -g nhyris
```

This will add the `nhyris` command to your PATH.

## How to use

You can use the following commands after installing nhyris:

- Initialize a new project (replace `myapp` with your project name):

```sh
nhyris init myapp
```

- Run your Shiny app in development mode:

```sh
nhyris run myapp
```

- Update dependencies and project files:

```sh
nhyris update myapp
```

- Build a standalone Electron application:

```sh
nhyris build myapp
```

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
