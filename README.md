# Github Release Action

This GitHub Action automates the process of calculating a new semantic version tag based on the latest tag found in the repository. It increments the patch version while keeping the major and minor versions as specified.

## Inputs

### `major`

**Required** The major version number. This should be incremented when there are incompatible API changes.

### `minor`

**Required** The minor version number. This should be incremented when functionality is added in a backward-compatible manner.

### `github-token`

**Required** A GitHub token to authenticate API requests. Typically, this will be the GitHub Actions provided `${{ secrets.GITHUB_TOKEN }}`.

## Outputs

### `new-version`

The new version tag created by the action.

## Example Usage

```yaml
jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Calculate Version and Create Release
        id: versioning
        uses: zcubbs/gh-release-action@v1
        with:
          major: '1'
          minor: '0'
          github-token: ${{ secrets.GITHUB_TOKEN }}

      - name: Use the new version
        run: echo "The new version is ${{ steps.versioning.outputs.new-version }}"
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
