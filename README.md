![Project banner](./images/banner.png)

[![Node.js](https://img.shields.io/badge/node.js-22.13.1-5FA04E?logo=nodedotjs&style=for-the-badge&logoColor=white)](https://nodejs.org/)
[![npm](https://img.shields.io/badge/npm-11.4.1-CB3837?logo=npm&style=for-the-badge&logoColor=white)](https://nodejs.org/)
[![Electron](https://img.shields.io/badge/electron-36.4.0-47848F?logo=electron&style=for-the-badge&logoColor=white)](https://www.electronjs.org/)
[![Electron Forge](https://img.shields.io/badge/electron--forge-7.8.0-6aa4b4?logo=electron&style=for-the-badge&logoColor=white)](https://www.electronforge.io/)
[![R](https://img.shields.io/badge/R-4.5.0-276DC3?logo=R&style=for-the-badge&logoColor=white)](https://www.r-project.org/)
[![pak](https://img.shields.io/badge/pak-0.9.0-1E90FF?style=for-the-badge&logoColor=white)](https://pak.r-lib.org/)

# nhyris

The minimal framework for transform R shiny application into standalone

## Demo video in youtube (new page)

<a href='https://youtu.be/P300v5u-PPI' target="_blank">
  <img src='https://github.com/user-attachments/assets/fc93f66b-2add-4d03-9c38-8901b147a769'>
</a>

## How to use

[![Use this template](https://img.shields.io/badge/USE_THIS_TEMPLATE-54A258?style=for-the-badge)](https://github.com/new?template_owner=jahnen&template_name=nhyris&owner=%40me)

- install node

```sh
sh ./node.sh
```

- make project: assuming 'myapp'

```sh
sh ./project.sh myapp
```

- modify meta data: `myapp/package.json`
- modify shiny application with yours: `myapp/shiny/app.R`

- build electron application

```sh
sh ./electron.sh myapp
```

- finish

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
