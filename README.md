# PHP Group imports

Command Pallet > `PHP Group Imports`

## Requirements

`VS Code version` - 1.87.0

## Known Issues

- ~~[x] Namespaces duplicated when commented import statement exist.~~
- [ ] having first import statement commented with `#` or `/*` will be duplicated in output.
- [ ] Performance drawback because whole file re-write is used.
- [ ] Allow Customization via extension setting.
    - [ ] Sort (by length) classes inside group if enabled from settings
    - [ ] Sort (by length) imports if enabled from settings


## Release Notes

Coming soon....

### 0.1.0

- Initial project structure
- Initial php import grouping logic implementation

### 1.0.0

- Handle commented imports (single line comment with `#` or `//` and block comment with `/* */`)

**Enjoy!**
