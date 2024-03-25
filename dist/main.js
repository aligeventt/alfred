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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const GithubService_1 = require("./service/github/GithubService");
const OpenAIService_1 = require("./service/openai/OpenAIService");
const parse_diff_1 = __importDefault(require("parse-diff"));
const minimatch_1 = __importDefault(require("minimatch"));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const githubService = new GithubService_1.GithubService();
        const openAIService = new OpenAIService_1.OpenAIService();
        const repository = (_a = process.env.GITHUB_REPOSITORY) !== null && _a !== void 0 ? _a : "";
        const [owner, repo] = repository.split("/");
        const number = parseInt(process.env.PULL_REQUEST_NUMBER || "");
        const pullRequest = yield githubService.getPullRequest(owner, repo, number);
        const parsedDiff = (0, parse_diff_1.default)(yield githubService.getPullRequestDiff(owner, repo, number));
        const excludePatterns = core
            .getInput("exclude")
            .split(",")
            .map((s) => s.trim());
        const filteredDiff = parsedDiff.filter((file) => {
            return !excludePatterns.some((pattern) => {
                var _a;
                minimatch_1.default.minimatch((_a = file.to) !== null && _a !== void 0 ? _a : "", pattern);
            });
        });
        const comments = [];
        for (const file of filteredDiff) {
            if (file.to === "/dev/null")
                continue;
            for (const chunk of file.chunks) {
                const prDiff = yield githubService.getPullRequestDiff(owner, repo, number);
                const review = yield openAIService.createPullRequestReview(pullRequest, prDiff);
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
        yield githubService.createComment(owner, repo, number, comments);
    });
}
main().catch((error) => {
    console.error("Error:", error);
    process.exit(1);
});
