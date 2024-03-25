import { OpenAI } from "openai";
import * as core from "@actions/core";
import { ReviewComment } from "../../model/ReviewComment";
export class OpenAIService {
  private readonly openAI: OpenAI;
  constructor() {
    const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
    console.log("OpenAI API:, ", OPENAI_API_KEY);
    this.openAI = new OpenAI({
      apiKey: OPENAI_API_KEY,
    });
  }

  createPullRequestReview = async (pullRequest: any, diff: string) => {
    const prompt = this.prompt(pullRequest, diff);
    console.log("Prompt: ", prompt);
    const response = await this.openAI.chat.completions.create({
      model: "gpt-3.5-turbo",
      temperature: 0.2,
      max_tokens: 700,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      messages: [
        {
          role: "system",
          content: prompt,
        },
      ],
    });

    if (response.choices.length > 0) {
      try {
        console.log("RESPONSE: ", response.choices[0].message?.content);
        return JSON.parse(response.choices[0].message?.content?.trim() || "")
          .review as Array<ReviewComment>;
      } catch (error) {
        throw new Error(`Error parsing response from OpenAI: ${error}`);
      }
    }
  };

  private prompt = (pullRequest: any, diff: string) => {
    return `Create a pull request review for the following pull request:
                Instructions:
                - Review the pull request
                - Provide feedback
                - Do not provide positive comments or positive feedback
                - Provide constructive feedback
                
                - Follow Clean Code Principles
                
                Review the following pull request:
                
                ## Pull Request Title: ${pullRequest.title}
                ## Pull Request Description: ${pullRequest.description}
                ## Pull Request Number: ${pullRequest.number}
                ## Pull Request Owner: ${pullRequest.owner}
                ## Pull Request Name: ${pullRequest.name}

                Code diff to review:
                \`\`\`
                ${diff}
                \`\`\`
                `;
  };
}
