# Chrome Web Store auto publish

To enable automatic publishing, create a workflow file at `.github/workflows/chrome-webstore.yml` (GitHub requires the `workflow` token scope to push this file).

```yaml
name: Publish to Chrome Web Store

on:
  workflow_dispatch:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Package extension
        run: |
          rm -f mdreader.zip
          zip -r mdreader.zip . -x '*.git*' -x 'node_modules/*' -x '.github/*' -x '*.md' -x 'icon.svg'

      - name: Upload & publish
        uses: mnao305/chrome-extension-upload@v4.0.1
        with:
          file-path: mdreader.zip
          extension-id: ${{ secrets.CW_EXTENSION_ID }}
          client-id: ${{ secrets.CW_CLIENT_ID }}
          client-secret: ${{ secrets.CW_CLIENT_SECRET }}
          refresh-token: ${{ secrets.CW_REFRESH_TOKEN }}
          publish: true
```

## Required secrets

- `CW_EXTENSION_ID`
- `CW_CLIENT_ID`
- `CW_CLIENT_SECRET`
- `CW_REFRESH_TOKEN`
