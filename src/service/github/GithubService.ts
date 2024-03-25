import { PullRequest } from "../../model/PullRequest";
import { mapPullRequest } from "../../model/mapper/PullRequest.mapper";
import { Octokit } from "@octokit/rest";
import { Comment } from "../../model/mapper/Comment";

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

const octokit = new Octokit({
  auth: GITHUB_TOKEN,
});

export class GithubService {
  getPullRequest = async (
    owner: string,
    repo: string,
    number: number,
  ): Promise<PullRequest> => {
    const pullRequest = await octokit.request(
      "GET /repos/{owner}/{repo}/pulls/{pull_number}",
      {
        owner,
        repo,
        pull_number: number,
      },
    );

    return mapPullRequest(pullRequest);
  };

  getPullRequestDiff = async (
    owner: string,
    repo: string,
    number: number,
  ): Promise<string> => {
    const diff = await octokit.pulls.get({
      owner,
      repo,
      pull_number: number,
      mediaType: {
        format: "diff",
      },
    });
    return diff.data as unknown as string;
  };

  createComment = async (
    owner: string,
    repo: string,
    number: number,
    comments: Array<Comment>,
  ): Promise<void> => {
    await octokit.pulls.createReview({
      owner,
      repo,
      pull_number: number,
      comments: comments.map((comment) => {
        return {
          path: comment.path,
          position: comment.line,
          body: comment.body,
        };
      }),
    });
  };
}
