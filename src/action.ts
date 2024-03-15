import * as github from '@actions/github';
import * as core from '@actions/core';
import { RequestError } from '@octokit/request-error'

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

    let remaining = [];
    let shouldRemoveLabel = true;

    for (const label of labels) {
      if (core.getBooleanInput('remove_if_exists') == true) {
        try {
          // check if label exists on issue
          await client.rest.issues.getLabel({
            name: label,
            owner,
            repo
          });
        } catch (err) {
          if (err instanceof RequestError && err.status == 404) {
            core.notice(`label: ${label} does not exist`);
            shouldRemoveLabel = false;
          }
        }
      }

      try {
        if (shouldRemoveLabel == true) {
          await client.rest.issues.removeLabel({
            name: label,
            owner,
            repo,
            issue_number: number
          });
        }
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

    if (core.getBooleanInput('fail_on_error') == true) {
      core.setFailed((e as Error).message);
    }
  }
}

// export the function to be used in the action
export default run;
