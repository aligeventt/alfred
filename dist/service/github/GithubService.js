"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GithubService = void 0;
const core = __importStar(require("@actions/core"));
const PullRequest_mapper_1 = require("../../model/mapper/PullRequest.mapper");
const rest_1 = require("@octokit/rest");
const GITHUB_TOKEN = core.getInput("GITHUB_TOKEN");
const octokit = new rest_1.Octokit({
    auth: GITHUB_TOKEN,
});
class GithubService {
    constructor() {
        this.getPullRequest = (owner, repo, number) => __awaiter(this, void 0, void 0, function* () {
            const pullRequest = yield octokit.request("GET /repos/{owner}/{repo}/pulls/{pull_number}", {
                owner,
                repo,
                pull_number: number,
            });
            return (0, PullRequest_mapper_1.mapPullRequest)(pullRequest);
        });
        this.getPullRequestDiff = (owner, repo, number) => __awaiter(this, void 0, void 0, function* () {
            const diff = yield octokit.pulls.get({
                owner,
                repo,
                pull_number: number,
                mediaType: {
                    format: "diff",
                },
            });
            return diff.data;
        });
        this.createComment = (owner, repo, number, comments) => __awaiter(this, void 0, void 0, function* () {
            yield octokit.pulls.createReview({
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
        });
    }
}
exports.GithubService = GithubService;
