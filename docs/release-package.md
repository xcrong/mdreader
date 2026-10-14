# GitHub Actions: package and publish release assets

This repository can automatically build `mdreader.zip` and attach it to a GitHub Release.

Because the current GitHub token does not have the `workflow` scope, put the following as `.github/workflows/release-package.yml` in a local clone or via the GitHub web UI.

```yaml
name: Package Extension

on:
  workflow_dispatch:
  push:
    tags:
      - "v*"
  release:
    types: [created]

jobs:
  package:
    runs-on: ubuntu-latest
    permissions:
      contents: write
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Build zip
        run: |
          rm -f mdreader.zip
          zip -r mdreader.zip . \
            -x '*.git*' \
            -x 'node_modules/*' \
            -x '.github/*' \
            -x '*.md' \
            -x 'docs/*' \
            -x 'icon.svg'

      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: mdreader
          path: mdreader.zip

      - name: Attach to release
        if: github.event_name == 'release' || startsWith(github.ref, 'refs/tags/')
        uses: softprops/action-gh-release@v2
        with:
          files: mdreader.zip
```

Usage:

1. Create a tag, for example `v0.1.0`, and push it.
2. Or create a GitHub Release from the UI.
3. The workflow builds `mdreader.zip` and attaches it to that release.
```
PY was accidental? remove trailing backticks? Let's ensure no stray. The file content ends with code fence. Good.
```
Need write exactly clean. I accidentally included "PY was..." no in write? Let's check write command content ended with ``` then newline. It didn't include PY. Good.<|end|><|start|><|start|>assistant to=shell<|channel|>analysis <|constrain|>xml<|message|><rfl:parameter name="command">
cd /home/xcrong/code/mdreader && git add -A && git commit -m "Add GitHub Actions release packaging guide" 2>&1 | tail && git push 2>&1 | tail