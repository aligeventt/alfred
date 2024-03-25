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
exports.OpenAIService = void 0;
const openai_1 = require("openai");
const core = __importStar(require("@actions/core"));
const OPENAI_API_KEY = core.getInput("OPENAI_API_KEY");
class OpenAIService {
    constructor() {
        this.createPullRequestReview = (pullRequest, diff) => __awaiter(this, void 0, void 0, function* () {
            const prompt = this.prompt(pullRequest, diff);
            const response = yield this.openAI.completions.create({
                model: "gpt-3.5-turbo",
                max_tokens: 100,
                n: 1,
                stop: "\n",
                prompt,
            });
            if (response.choices.length > 0) {
                try {
                    return JSON.parse(response.choices[0].text)
                        .review;
                }
                catch (error) {
                    throw new Error(`Error parsing response from OpenAI: ${error}`);
                }
            }
        });
        this.prompt = (pullRequest, diff) => {
            return `Create a pull request review for the following pull request:
                ## Pull Request Title: ${pullRequest.title}
                ## Pull Request Description: ${pullRequest.description}
                ## Pull Request Number: ${pullRequest.number}
                ## Pull Request Owner: ${pullRequest.owner}
                ## Pull Request Name: ${pullRequest.name}

                Code diff to review:
                \`\`\`
                ${diff}
                \`\`\`

                Instructions:
                - Review the pull request
                - Provide feedback
                - Do not provide positive comments or positive feedback
                - Provide constructive feedback
                - Give the response in the given JSON format: {"review": ["line": "{number}", "comment": "{comment}"]}
                - Follow Clean Code Principles
                `;
        };
        this.openAI = new openai_1.OpenAI({
            apiKey: OPENAI_API_KEY,
        });
    }
}
exports.OpenAIService = OpenAIService;
