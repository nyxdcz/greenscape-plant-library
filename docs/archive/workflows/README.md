# Historical workflow installers

These 20 workflow files installed earlier dashboard, sidebar, and Plant Library layouts. They were disabled before being moved here on October 22, 2026. Their contents are preserved unchanged for reference.

Files in this folder are outside `.github/workflows/`, so GitHub Actions does not load them as workflows. Embedded scripts and their original paths describe the older layouts; they are not instructions for maintaining the current catalogue.

## Current workflows

The maintained definitions remain in [`.github/workflows/`](../../../.github/workflows/):

- [`quality.yml`](../../../.github/workflows/quality.yml) checks pull requests and manual quality runs.
- [`deployment-package.yml`](../../../.github/workflows/deployment-package.yml) validates, packages, and publishes the website.
- [`sync-plant-csv.yml`](../../../.github/workflows/sync-plant-csv.yml) imports plant additions and synchronizes published catalogue data.
- [`repository-quality-audit.yml`](../../../.github/workflows/repository-quality-audit.yml) provides the repository audit workflow.

See the [documentation index](../../README.md) for current maintenance guides and the [earlier README](../README-before-cleanup-2026-10-22.md) for historical release notes.
