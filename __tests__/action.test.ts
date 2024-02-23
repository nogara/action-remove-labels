import * as github from '@actions/github';
import * as core from '@actions/core';
import run from '../src/action';

jest.mock('@actions/github');
jest.mock('@actions/core');

describe('Remove Label Action', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.resetAllMocks();
  });

  test('Removes a label that exists', async () => {
    const mockGetInput = core.getInput as jest.Mock;
    mockGetInput.mockImplementation((inputName) => {
      if (inputName === 'github_token') return 'fake-token';
      if (inputName === 'labels') return 'bug\nenhancement';
      if (inputName === 'repo') return 'owner/repo';
      if (inputName === 'number') return '1';
      if (inputName === 'remove_if_exists') return 'true';
    });

    const mockOctokit = {
      rest: {
        issues: {
          getLabel: jest.fn().mockResolvedValue({ status: 200 }),
          removeLabel: jest.fn().mockResolvedValue({ status: 200 }),
        },
      },
    };
    const mockGetOctokit = github.getOctokit as jest.Mock;
    mockGetOctokit.mockReturnValue(mockOctokit);

    await run();

    expect(mockOctokit.rest.issues.removeLabel).toHaveBeenCalledWith({
      name: 'bug',
      owner: 'owner',
      repo: 'repo',
      issue_number: 1,
    });
  });

    // Continuing from the previous examples...

  test('Does not fail when a label does not exist', async () => {
    const mockGetInput = core.getInput as jest.Mock;
    mockGetInput.mockImplementation((inputName) => {
      if (inputName === 'github_token') return 'fake-token';
      if (inputName === 'labels') return 'nonexistent-label';
      if (inputName === 'repo') return 'owner/repo';
      if (inputName === 'number') return '1';
      if (inputName === 'remove_if_exists') return 'true';
      if (inputName === 'fail_on_error') return 'false'; // Ensuring the action doesn't fail
    });

    const mockOctokit = {
      rest: {
        issues: {
          getLabel: jest.fn().mockRejectedValue({ status: 404 }), // Simulate label not found
          removeLabel: jest.fn().mockResolvedValue({ status: 200 }),
        },
      },
    };
    const mockGetOctokit = github.getOctokit as jest.Mock;
    mockGetOctokit.mockReturnValue(mockOctokit);

    const mockCoreWarning = core.warning as jest.Mock;

    await run();

    expect(mockCoreWarning).toHaveBeenCalledWith(expect.stringContaining('failed to remove label: nonexistent-label'));
    expect(mockOctokit.rest.issues.removeLabel).not.toHaveBeenCalledWith({
      name: 'nonexistent-label',
      owner: 'owner',
      repo: 'repo',
      issue_number: 1,
    });
  });

});
