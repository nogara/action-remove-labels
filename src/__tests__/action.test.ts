import * as github from '@actions/github';
import * as core from '@actions/core';
import run from '../action';

import { RequestError } from '@octokit/request-error'

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

  // test('Does not fail when a label does not exist and remove_if_exists is true', async () => {
  //   const mockGetInput = core.getInput as jest.Mock;
  //   mockGetInput.mockImplementation((inputName) => {
  //     if (inputName === 'github_token') return 'fake-token';
  //     if (inputName === 'labels') return 'nonexistent-label';
  //     if (inputName === 'repo') return 'owner/repo';
  //     if (inputName === 'number') return '1';
  //     if (inputName === 'remove_if_exists') return true;
  //     if (inputName === 'fail_on_error') return false; // Ensuring the action doesn't fail
  //   });



  //   const mockOctokit = {
  //     rest: {
  //       issues: {
  //         // mock returning a 404 error
  //         getLabel: jest.fn().mockRejectedValue(new RequestError("not found", 404, new RequestErrorOptions)), // Simulate label not found
  //         removeLabel: jest.fn().mockResolvedValue({ status: 200 }),
  //       },
  //     },
  //   };
  //   const mockGetOctokit = github.getOctokit as jest.Mock;
  //   mockGetOctokit.mockReturnValue(mockOctokit);

  //   // mock core.notice

  //   const mockCoreNotice = core.notice as jest.Mock;


  //   await run();

  //   // expect(mockOctokit.rest.issues.removeLabel).toHaveBeenCalledWith(expect.stringContaining('does not exist'));

  //   expect(mockOctokit.rest.issues.removeLabel).toHaveBeenCalledWith({
  //       name: 'nonexistent-label',
  //       owner: 'owner',
  //       repo: 'repo',
  //       issue_number: 1,
  //   });

  //   expect(mockCoreNotice.mock.calls).toHaveLength(1);

  // });

});
