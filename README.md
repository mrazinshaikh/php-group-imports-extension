# PHP Group imports

Command Pallet > `PHP Group Imports`

## Requirements

`VS Code version` - 1.87.0

## Known Issues

- ~~[x] Namespaces duplicated when commented import statement exist.~~
- ~~[x] having first import statement commented with `#` or `/*` will be duplicated in output.~~ see: [#4](https://github.com/mrazinshaikh/php-group-imports-extension/issues/4)
- [ ] Performance drawback because whole file re-write is used.
- ~~[x] Allow Customization via extension setting.~~ see [#7](https://github.com/mrazinshaikh/php-group-imports-extension/issues/7) - [#9](https://github.com/mrazinshaikh/php-group-imports-extension/issues/9)
    - ~~[x] Sort classes inside group if enabled from settings (`phpGroupImports.sortAlgorithm`)~~ see: [#7](https://github.com/mrazinshaikh/php-group-imports-extension/issues/7)
    - ~~[x] Order imports by type and php-cs imports-order rule defined from settings~~ see [#9](https://github.com/mrazinshaikh/php-group-imports-extension/issues/9)


## Extension Setting

- `phpGroupImports.notifyOnComplete` - To show the notification on group import operation completion or not. default true. see: [release v1.1.2](CHANGELOG.md#112)
- `phpGroupImports.sortAlgorithm` - Order the grouped imports by. 'alpha', 'length', 'null'. default alpha. see: [release v1.1.3](CHANGELOG.md#113)
- `phpGroupImports.importsOrder` - Order the use statements by type. ['const', 'class', 'function']. default null. see: [release v1.1.4](CHANGELOG.md#114)

Coming soon....

## Change Log
 See [CHANGELOG.md](CHANGELOG.md)

**Enjoy!**
