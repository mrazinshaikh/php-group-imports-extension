# Publish Guide

## Package extension into vsix
```sh
vsce package
```

### vsce is from @vscode/vsce
```sh
npm install -g @vscode/vsce
```

## Change to keep track of
- [package.json](package.json) - update the package version.

- [CHANGELOG.md](CHANGELOG.md) - Log new version details.

## Maintain version vsix file in builds folder.