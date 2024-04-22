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
    pull_number: number,
    comments: Array<Comment>,
  ): Promise<void> => {
    await octokit.pulls
      .createReview({
        owner,
        repo,
        pull_number,
        comments: comments.map((comment) => {
          return {
            path: comment.path,
            position: parseInt(comment.line.toString()) +1,
            body: comment.body,
          };
        }),
        event: "COMMENT",
      })
      .then(
        (response) => {
          console.log("Comment created: ", response);
        },
        (error) => {
          console.error("Error creating comment: ", error);
        },
      );
  };

  updatePullRequest = async (
    owner: string,
    repo: string,
    number: number,
    title: string,
    body: string,
  ): Promise<void> => {
    await octokit.pulls
      .update({
        owner,
        repo,
        pull_number: number,
        title,
        body,
      })
      .then(
        (response) => {
          console.log("Pull request updated: ", response);
        },
        (error) => {
          console.error("Error updating pull request: ", error);
        },
      );
  };

  deletePreviousReviewComments = async (
    owner: string,
    repo: string,
    pull_number: number,
  ): Promise<void> => {
    await octokit.pulls
      .listReviewComments({
        owner,
        repo,
        pull_number,
      })
      .then(
        async (response) => {
          console.log("Review comments: ", response.data);
          await Promise.all(
            response.data.map(async (comment) => {
              if (comment.user.login === "github-actions[bot]") {
                console.log("Deleting comment: ", comment.id);
                await octokit.pulls.deleteReviewComment({
                  owner,
                  repo,
                  comment_id: comment.id,
                });
              }
            }),
          );
        },
        (error) => {
          console.error("Error listing review comments: ", error);
        },
      );
  };
}
