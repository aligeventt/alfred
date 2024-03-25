import { PullRequest } from "../PullRequest";

// TODO the input type should be the type returned by the octokit API
export function mapPullRequest(pullRequest: any): PullRequest {
    return {
        title: pullRequest.data.title,
        description: pullRequest.data.body,
        number: pullRequest.data.number,
        owner: pullRequest.data.user.login,
        name: pullRequest.data.head.repo.name,
    };
}