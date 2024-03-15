import * as github from '@actions/github';
import * as core from '@actions/core';
import run from '../action';
import { mock } from 'node:test';

jest.mock('@actions/github');
jest.mock('@actions/core');

class RequestError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'RequestError';
    this.status = status;
  }
}


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
      if (inputName === 'remove_if_exists') return true;
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

  test('Does not fail when a label does not exist and remove_if_exists is true', async () => {
    const mockGetInput = core.getInput as jest.Mock;
    mockGetInput.mockImplementation((inputName) => {
      if (inputName === 'github_token') return 'fake-token';
      if (inputName === 'labels') return 'nonexistent-label';
      if (inputName === 'repo') return 'owner/repo';
      if (inputName === 'number') return '1';
      if (inputName === 'remove_if_exists') return true;
      if (inputName === 'fail_on_error') return false; // Ensuring the action doesn't fail
    });

    const mockGetBooleanInput = core.getBooleanInput as jest.Mock;
    mockGetBooleanInput.mockImplementation((inputName) => {
      if (inputName === 'remove_if_exists') return true;
      if (inputName === 'fail_on_error') return false;
    });

    const mockOctokit = {
      rest: {
        issues: {
          // mock returning a 404 error
          getLabel: jest.fn().mockRejectedValue(new RequestError("not found", 404)), // Simulate label not found
          removeLabel: jest.fn().mockResolvedValue({ status: 200 }),
        },
      },
    };
    const mockGetOctokit = github.getOctokit as jest.Mock;
    mockGetOctokit.mockReturnValue(mockOctokit);

    const mockCoreNotice = core.notice as jest.Mock;
    mockCoreNotice.mockImplementation((message) => {});

    await run();

    expect(mockOctokit.rest.issues.removeLabel).toHaveBeenCalledTimes(0);

  });

  test('Does fail when a label does not exist and remove_if_exists is false', async () => {
    const mockGetInput = core.getInput as jest.Mock;
    mockGetInput.mockImplementation((inputName) => {
      if (inputName === 'github_token') return 'fake-token';
      if (inputName === 'labels') return 'nonexistent-label';
      if (inputName === 'repo') return 'owner/repo';
      if (inputName === 'number') return '1';
      if (inputName === 'remove_if_exists') return true;
      if (inputName === 'fail_on_error') return false; // Ensuring the action doesn't fail
    });

    const mockGetBooleanInput = core.getBooleanInput as jest.Mock;
    mockGetBooleanInput.mockImplementation((inputName) => {
      if (inputName === 'remove_if_exists') return false;
      if (inputName === 'fail_on_error') return false;
    });

    const mockOctokit = {
      rest: {
        issues: {
          // mock returning a 404 error
          getLabel: jest.fn().mockRejectedValue(new RequestError("not found", 404)), // Simulate label not found
          removeLabel: jest.fn().mockResolvedValue({ status: 200 }),
        },
      },
    };
    const mockGetOctokit = github.getOctokit as jest.Mock;
    mockGetOctokit.mockReturnValue(mockOctokit);

    const mockCoreNotice = core.notice as jest.Mock;
    mockCoreNotice.mockImplementation((message) => {});

    await run();

    expect(mockOctokit.rest.issues.removeLabel).toHaveBeenCalledTimes(1);

  });


});
