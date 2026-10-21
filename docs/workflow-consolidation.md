# Website validation and publishing

Prepared on 22 October 2026 after reviewing the shared Copilot performance discussion against the actual repository.

## Execution layout

| Event | Workflow | Complete suite executions | Publishing |
| --- | --- | --- | --- |
| Pull request to main | Website Quality (`quality.yml`) | One | None |
| Push to main | Build Deployment Package and Deploy Pages (`deployment-package.yml`) | One, before packaging | Only after packaging succeeds |
| Manual quality run | Website Quality | One | None |
| Manual deployment on main | Build Deployment Package and Deploy Pages | One, before packaging | Only after packaging succeeds |
| Manual deployment on another branch | Build Deployment Package and Deploy Pages | Package job skipped | None |

The retired `ci.yml` previously duplicated the quality workflow on pull requests and main pushes. Removing it and removing the standalone quality workflow's main-push trigger reduces standard pull requests from two full suite executions to one, and main releases from three to one. These are execution counts from the workflow configuration, not measured website speed or promised build-time savings. Explicit manual runs and narrowly triggered utility workflows may still perform their own requested validation.

The full suite remains `npm run quality`, including plant import/sync checks, lint, catalogue/storage/image tests, entry/sharing/workflow regression tests, repository validation, static build validation, and audit. Pull requests do not receive a reduced test subset. The `quality` job identifier is retained. A read-only GitHub check found main had no branch protection or effective branch rules when this change was prepared; no branch rules are modified.

Website Quality keeps read-only repository permissions, a ten-minute timeout, and cancellation of superseded checks. Deployment keeps its fifteen-minute validation/package timeout and separate non-cancelling Pages concurrency group. The publishing job retains `needs: package` with normal successful-dependency behavior. A main-ref condition on the package job prevents a manually selected feature branch from reaching publishing. Node 20 and setup-node v6 with automatic package-manager caching disabled are consistent across the two paths. The repository declares no dependency packages or lockfile, so no installation or package cache was introduced.

All 19 design `apply-*` workflows already restrict automatic execution to changes to their own workflow files and offer manual dispatch. They are unchanged. Plant CSV synchronization and other narrowly triggered utility workflows are also unchanged.

## Pages configuration

The repository's live Pages configuration was found to use `build_type: legacy` with source main at `/`. This allowed the separate built-in pages-build-deployment workflow to publish directly from the branch alongside the custom validated deployment. The release path requires Pages source **GitHub Actions** (`build_type: workflow`), matching the existing custom deployment workflow. Changing the Pages source is a repository setting, separate from merging the workflow files. It does not alter the site's URL, domain, HTTPS policy, page markup, assets, or catalogue data.

GitHub's [publishing-source documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site) describes this source selection. The corresponding [Pages REST endpoint](https://docs.github.com/en/rest/pages/pages#update-information-about-a-github-pages-site) supports the build-type update. The deployment workflow already exists on main and has successfully published the current website; no initial workflow needs to be generated.

The Pages source was switched to `workflow` as part of this authorized consolidation. A subsequent API read confirmed `build_type: workflow`, `status: built`, the same website URL, no custom domain, and HTTPS enforcement still enabled. The published page returned HTTP 200 after the switch. The pre-change configuration was saved locally before the update. No branch protection or access permissions were changed. The revised workflow files still require merge; the existing validated deployment workflow remains available on main in the meantime.

## Verification

- `npm run quality` passed all 61 tests: 25 catalogue/storage/image tests, 26 entry/sharing tests, and ten new workflow regression tests, followed by repository validation, static build validation, and audit. All 231 records remain synchronized.
- Both edited YAML files were independently parsed with Ruby's safe YAML loader. The resulting events/jobs match the execution table above. Ruby is an authoring check only; CI still uses Node and adds no dependency.
- Workflow tests reject restoring the retired workflow, introducing a differently named broad duplicate, duplicating main-push validation, skipping pull-request paths, running only partial checks, ignoring failures, validating after packaging, bypassing the package dependency, deploying from a feature branch or pull request, restoring lockfile caching, granting write permissions to the pull-request check, or dropping timeout/cancellation safeguards.
- The workflow contract validator checks the repository's explicit block-style YAML conventions. It is not a general YAML parser. It runs during both ordinary repository validation and static build validation, so historical automation that restores duplicate configuration is caught before publishing.
- `git diff --check` passes. No application HTML, CSS, JavaScript, photographs, catalogue data, browser storage, or website cache keys are changed by this consolidation.

The pull-request run verifies the new quality workflow on GitHub. The first main release using these revised workflow files occurs after merge; local checks cannot demonstrate that future execution. Website browsing/search performance is a separate measurement task.

## Operating notes

Open pull requests normally; Website Quality runs the complete suite once. After merging, check the validation/package and deployment jobs in Build Deployment Package and Deploy Pages. If validation fails, the dependent publishing job must remain skipped. For a manual deployment, select main; another branch deliberately skips packaging and publishing. For a check without publishing, use Website Quality's manual run.

Use repository Settings > Pages to inspect the publishing source. Restoring branch-based publication would restore a release path outside the custom validation gate. Historical interface verification notes describe the workflow names that existed when those earlier checks ran; the execution table here describes the consolidated layout.
