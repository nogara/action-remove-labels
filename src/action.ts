import * as github from '@actions/github';
import * as core from '@actions/core';

async function run(): Promise<void> {
  try {
    const githubToken = core.getInput('github_token');

    const labels = core
      .getInput('labels')
      .split('\n')
      .filter(l => l !== '');
    const [owner, repo] = core.getInput('repo').split('/');
    const number =
      core.getInput('number') === ''
        ? github.context.issue.number
        : parseInt(core.getInput('number'));

    if (labels.length === 0) {
      return;
    }

    const client = github.getOctokit(githubToken);

    const remaining = [];
    for (const label of labels) {
      try {

        if (core.getInput('remove_if_exists') === 'true') {
          // check if label exists on issue
          let exists_label = await client.rest.issues.getLabel({
            name: label,
            owner,
            repo
          });

          if (exists_label.status !== 200) {
            core.notice(`label: ${label} does not exist`);
            continue;
          }
        }

        await client.rest.issues.removeLabel({
          name: label,
          owner,
          repo,
          issue_number: number
        });

      } catch (e) {
        core.warning(`failed to remove label: ${label}: ${e}`);
        remaining.push(label);
      }
    }

    if (remaining.length) {
      throw new Error(`failed to remove labels: ${remaining}`);
    }
  } catch (e) {
    core.error(e as Error);

    if (core.getInput('fail_on_error') === 'true') {
      core.setFailed((e as Error).message);
    }
  }
}

// export the function to be used in the action
export default run;
