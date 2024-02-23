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

  // Add more tests here for other scenarios

});
