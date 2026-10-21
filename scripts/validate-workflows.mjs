// These guards check the repository's explicit block-style workflow contract, not arbitrary YAML.
function block(source, key, indentation = 0) {
  const lines = source.split('\n');
  const prefix = `${' '.repeat(indentation)}${key}:`;
  const start = lines.findIndex(line => line.startsWith(prefix));
  if (start === -1) return '';
  let end = start + 1;
  while (end < lines.length && (!lines[end].trim() || lines[end].search(/\S/) > indentation)) end += 1;
  return lines.slice(start, end).join('\n');
}

const keys = (source, indentation) => [...source.matchAll(new RegExp(`^ {${indentation}}([\\w-]+):`, 'gm'))].map(match => match[1]);
const suiteCount = source => (source.match(/\bnpm run quality\b/g) || []).length;
const mainOnly = source => {
  const branches = block(source, 'branches', 4);
  return /^ {4}branches:\s*\n {6}- main\s*$/.test(branches.trimEnd()) && !/^ {4}paths(?:-ignore)?:/m.test(source);
};

export function validateWorkflowLayout(workflows) {
  const failures = [];
  const check = (condition, message) => { if (!condition) failures.push(message); };
  const quality = workflows['quality.yml'] || '';
  const deployment = workflows['deployment-package.yml'] || '';
  check(!Object.hasOwn(workflows, 'ci.yml'), 'Retired ci.yml must not reintroduce duplicate Website Checks.');
  check(Boolean(quality && deployment), 'Quality and deployment workflows must both exist.');

  const qualityEvents = block(quality, 'on');
  check(keys(qualityEvents, 2).sort().join(',') === 'pull_request,workflow_dispatch'
    && mainOnly(block(qualityEvents, 'pull_request', 2)), 'Website Quality must run for every pull request to main and manual runs, without a duplicate main push trigger.');
  check(keys(block(quality, 'jobs'), 2).join(',') === 'quality', 'Website Quality must retain one quality job.');
  check(suiteCount(quality) === 1 && /^ {8}run: npm run quality\s*$/m.test(quality)
    && !/^\s+(?:if|continue-on-error):/m.test(quality), 'Pull requests must run the complete quality suite once without conditional skips or ignored failures.');
  check(/^permissions:\s*\n  contents: read\s*$/m.test(quality)
    && !/^\s+[\w-]+: write\s*$/m.test(quality), 'Pull request validation must retain read-only permissions.');
  check(/timeout-minutes: 10/.test(quality) && /cancel-in-progress: true/.test(quality)
    && /group: website-quality-\$\{\{ github.ref \}\}/.test(quality), 'Pull request validation must remain bounded and cancel superseded runs in its own concurrency group.');

  const deployEvents = block(deployment, 'on');
  check(keys(deployEvents, 2).sort().join(',') === 'push,workflow_dispatch'
    && mainOnly(block(deployEvents, 'push', 2)), 'Deployment must run for main pushes and manual runs, without pull request triggers or path skips.');
  const packageJob = block(block(deployment, 'jobs'), 'package', 2);
  const deployJob = block(block(deployment, 'jobs'), 'deploy', 2);
  const packageSteps = block(packageJob, 'steps', 4);
  const suitePosition = packageSteps.indexOf('run: npm run quality');
  const packagePosition = packageSteps.indexOf('name: Create clean deployment directory');
  check(suiteCount(deployment) === 1 && suitePosition >= 0 && packagePosition > suitePosition
    && /^ {8}run: npm run quality\s*$/m.test(packageSteps)
    && !/^\s+if:/m.test(packageSteps) && !/^\s+continue-on-error:/m.test(packageJob), 'The complete quality suite must succeed once before packaging, without skipped or ignored validation.');
  check(/^ {4}if: github.ref == 'refs\/heads\/main'\s*$/m.test(packageJob), 'Manual deployment must be limited to main.');
  check(/^ {4}needs: package\s*$/m.test(deployJob)
    && !/^\s+(?:if|continue-on-error):/m.test(deployJob)
    && /uses: actions\/deploy-pages@v4/.test(deployJob), 'Publishing must depend on successful packaging and must not bypass failures.');
  check(/timeout-minutes: 15/.test(packageJob) && /contents: read/.test(block(packageJob, 'permissions', 4)), 'Packaging must keep its timeout and read-only repository permissions.');

  for (const [name, source] of [['quality.yml', quality], ['deployment-package.yml', packageJob]]) {
    check(source.includes('uses: actions/setup-node@v6') && source.includes('node-version: 20')
      && source.includes('package-manager-cache: false') && !/cache: npm|\bnpm (?:ci|install)\b/.test(source), `${name} must retain Node 20 and dependency-free setup without lockfile caching or installation.`);
  }
  for (const [name, source] of Object.entries(workflows)) {
    if (['quality.yml', 'deployment-package.yml'].includes(name) || !suiteCount(source)) continue;
    const events = block(source, 'on');
    const broadPush = keys(events, 2).includes('push') && !/^ {4}paths:/m.test(block(events, 'push', 2));
    check(!keys(events, 2).includes('pull_request') && !broadPush, `Unexpected duplicate automatic quality run in ${name}.`);
  }
  return failures;
}
