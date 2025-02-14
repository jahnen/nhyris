![Project banner](./images/banner.png)

# nhyris

The minimal framework for transform R shiny application into standalone

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

This project is licensed under the **Creative Commons Attribution-NonCommercial 4.0 International (CC BY-NC 4.0)**.  
See the [LICENSE](./LICENSE) file for details.

[![License: CC BY-NC 4.0](https://licensebuttons.net/l/by-nc/4.0/88x31.png)](https://creativecommons.org/licenses/by-nc/4.0/)
