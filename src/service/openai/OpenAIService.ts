import { OpenAI } from "openai";
import * as core from "@actions/core";
import { ReviewComment } from "../../model/ReviewComment";
const OPENAI_API_KEY = core.getInput("OPENAI_API_KEY");
export class OpenAIService {
  private readonly openAI: OpenAI;
  constructor() {
    console.log("OpenAI API:, ", OPENAI_API_KEY);
    this.openAI = new OpenAI({
      apiKey: OPENAI_API_KEY,
    });
  }

  createPullRequestReview = async (pullRequest: any, diff: string) => {
    const prompt = this.prompt(pullRequest, diff);
    const response = await this.openAI.completions.create({
      model: "gpt-3.5-turbo",
      max_tokens: 100,
      n: 1,
      stop: "\n",
      prompt,
    });

    if (response.choices.length > 0) {
      try {
        return JSON.parse(response.choices[0].text)
          .review as Array<ReviewComment>;
      } catch (error) {
        throw new Error(`Error parsing response from OpenAI: ${error}`);
      }
    }
  };

  private prompt = (pullRequest: any, diff: string) => {
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
}
