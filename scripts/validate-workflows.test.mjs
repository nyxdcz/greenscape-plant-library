import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { validateWorkflowLayout } from './validate-workflows.mjs';

const directory = new URL('../.github/workflows/', import.meta.url);
const original = Object.fromEntries(fs.readdirSync(directory).filter(file => /\.ya?ml$/.test(file))
  .map(file => [file, fs.readFileSync(new URL(file, directory), 'utf8')]));
const fixture = () => ({ ...original });
const errors = workflows => validateWorkflowLayout(workflows).join('\n');

test('one full pull request check and validation before main deployment pass', () => {
  assert.deepEqual(validateWorkflowLayout(fixture()), []);
});

test('restoring either the retired workflow or another broad duplicate is rejected', () => {
  for (const name of ['ci.yml', 'extra-check.yml', 'extra-check.yaml']) {
    const workflows = fixture();
    workflows[name] = workflows['quality.yml'];
    assert.match(errors(workflows), /duplicate/i);
  }
});

test('duplicate push validation and path-skipped pull request checks are rejected', () => {
  const duplicate = fixture();
  duplicate['quality.yml'] = duplicate['quality.yml'].replace('  pull_request:', '  push:\n    branches:\n      - main\n  pull_request:');
  assert.match(errors(duplicate), /without a duplicate main push trigger/);
  const skipped = fixture();
  skipped['quality.yml'] = skipped['quality.yml'].replace('  workflow_dispatch:', '    paths-ignore:\n      - docs/**\n  workflow_dispatch:');
  assert.match(errors(skipped), /every pull request to main/);
});

test('replacing the full suite with a partial command is rejected in both paths', () => {
  for (const name of ['quality.yml', 'deployment-package.yml']) {
    const workflows = fixture();
    workflows[name] = workflows[name].replace('run: npm run quality', 'run: npm run lint');
    assert.match(errors(workflows), /complete quality suite/);
  }
});

test('ignored failures and conditionally skipped validation cannot pass', () => {
  for (const name of ['quality.yml', 'deployment-package.yml']) {
    for (const extra of ['continue-on-error: true', "if: github.event_name == 'push'"]) {
      const workflows = fixture();
      workflows[name] = workflows[name].replace('        run: npm run quality', `        ${extra}\n        run: npm run quality`);
      assert.match(errors(workflows), /ignored|skipped|skips/);
    }
    const shellBypass = fixture();
    shellBypass[name] = shellBypass[name].replace('run: npm run quality', 'run: npm run quality || true');
    assert.match(errors(shellBypass), /ignored|skipped|skips/);
  }
  const jobBypass = fixture();
  jobBypass['deployment-package.yml'] = jobBypass['deployment-package.yml'].replace('    timeout-minutes: 15', '    continue-on-error: true\n    timeout-minutes: 15');
  assert.match(errors(jobBypass), /ignored validation/);
});

test('packaging before validation is rejected', () => {
  const workflows = fixture();
  const step = '      - name: Run website quality checks\n        run: npm run quality\n\n';
  workflows['deployment-package.yml'] = workflows['deployment-package.yml'].replace(step, '')
    .replace('      - name: Upload downloadable deployment package', `${step}      - name: Upload downloadable deployment package`);
  assert.match(errors(workflows), /before packaging/);
});

test('publishing without a successful package dependency is rejected', () => {
  for (const replacement of ['', '    needs: package\n    if: always()']) {
    const workflows = fixture();
    workflows['deployment-package.yml'] = workflows['deployment-package.yml'].replace('    needs: package', replacement);
    assert.match(errors(workflows), /Publishing must depend/);
  }
});

test('feature-branch manual deployment and pull request deployment are rejected', () => {
  const branch = fixture();
  branch['deployment-package.yml'] = branch['deployment-package.yml'].replace("    if: github.ref == 'refs/heads/main'\n", '');
  assert.match(errors(branch), /limited to main/);
  const pullRequest = fixture();
  pullRequest['deployment-package.yml'] = pullRequest['deployment-package.yml'].replace('  workflow_dispatch:', '  pull_request:\n  workflow_dispatch:');
  assert.match(errors(pullRequest), /without pull request triggers/);
});

test('lockfile caching or unnecessary installation is rejected in either setup', () => {
  for (const name of ['quality.yml', 'deployment-package.yml']) {
    const workflows = fixture();
    workflows[name] = workflows[name].replace('package-manager-cache: false', 'cache: npm');
    assert.match(errors(workflows), /dependency-free setup/);
  }
});

test('write permissions, unbounded checks, and dropped cancellation are rejected', () => {
  for (const [from, to, expected] of [['contents: read', 'contents: write', /read-only permissions/], ['    timeout-minutes: 10\n', '', /bounded/], ['cancel-in-progress: true', 'cancel-in-progress: false', /cancel superseded/]]) {
    const workflows = fixture();
    workflows['quality.yml'] = workflows['quality.yml'].replace(from, to);
    assert.match(errors(workflows), expected);
  }
});
