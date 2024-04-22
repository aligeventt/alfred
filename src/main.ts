import * as core from "@actions/core";
import { GithubService } from "./service/github/GithubService";
import { OpenAIService } from "./service/openai/OpenAIService";
import parseDiff from "parse-diff";
import { Comment } from "./model/mapper/Comment";
import { readFileSync } from "fs";
import { minimatch } from "minimatch";

async function main() {
  const githubService = new GithubService();
  const openAIService = new OpenAIService();

  const { repository, number } = JSON.parse(
    readFileSync(process.env.GITHUB_EVENT_PATH || "", "utf8"),
  );
  const owner = repository.owner.login;
  const repo = repository.name;
  const pullRequest = await githubService.getPullRequest(owner, repo, number);
  console.log("Pull Request: ", pullRequest)

  const parsedDiff = parseDiff(
    await githubService.getPullRequestDiff(owner, repo, number),
  );

  const excludePatterns = core
    .getInput("exclude")
    .split(",")
    .map((s) => s.trim());

  const filteredDiff = parsedDiff.filter((file) => {
    return !excludePatterns.some((pattern) => {
      minimatch(file.to ?? "", pattern);
    });
  });

  const comments: Comment[] = [];
  for (const file of filteredDiff) {
    if (file.to === "/dev/null") continue;
    for (const chunk of file.chunks) {
      const prDiff = await githubService.getPullRequestDiff(
        owner,
        repo,
        number,
      );
      const review = await openAIService.createPullRequestReview(
        pullRequest,
        prDiff,
      );
      if (review) {
        review.forEach((reviewComment) => {
          if (!file.to) {
            return [];
          }
          comments.push({
            path: file.to,
            line: reviewComment.line,
            body: reviewComment.comment,
          });
        });
      }
    }
  }
  await githubService.createComment(owner, repo, number, comments).then(
    () => {
      console.log("Comment created successfully");
    },
    (error) => {
      console.error("Error creating comment: ", error);
    }
  );
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
