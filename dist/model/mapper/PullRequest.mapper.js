"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapPullRequest = void 0;
// TODO the input type should be the type returned by the octokit API
function mapPullRequest(pullRequest) {
    return {
        title: pullRequest.data.title,
        description: pullRequest.data.body,
        number: pullRequest.data.number,
        owner: pullRequest.data.user.login,
        name: pullRequest.data.head.repo.name,
    };
}
exports.mapPullRequest = mapPullRequest;
