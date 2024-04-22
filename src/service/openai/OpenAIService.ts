import { OpenAI } from "openai";
import { ReviewComment } from "../../model/ReviewComment";
import { PullRequest } from "../../model/PullRequest";
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
    const prompt = this.prReviewPrompt(pullRequest, diff);
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
        const parsedJson = JSON.parse(
          response.choices[0].message?.content?.trim() || "",
        ).review as Array<ReviewComment>;
        console.log("Parsed JSON: ", parsedJson);
        return parsedJson;
      } catch (error) {
        throw new Error(`Error parsing response from OpenAI: ${error}`);
      }
    }
  };

  createUnitTest = async (fileName: string, framework: string) => {
    const prompt = this.unitTestPrompt(fileName, framework);
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
        return response.choices[0].message?.content?.trim();
      } catch (error) {
        throw new Error(`Error parsing response from OpenAI: ${error}`);
      }
    }
  };

  createPullRequestDescription = async (
    pullRequest: PullRequest,
    diff: string,
  ) => {
    const prompt = this.prDescriptionPrompt(pullRequest, diff);
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
        return response.choices[0].message?.content?.trim();
      } catch (error) {
        throw new Error(`Error parsing response from OpenAI: ${error}`);
      }
    }
  };

  private prReviewPrompt = (pullRequest: PullRequest, diff: string) => {
    return `Create a pull request review for the following pull request:
                Instructions:
                - Provide the response in following JSON format:  {review: [{"lineNumber": "1", "reviewComment": "This is a comment"}]}
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

  private unitTestPrompt = (fileName: string, framework: string): string => {
    return `Generate a unit test with the ${framework} syntax for the following file: ${fileName}.
          Instructions:
            - Tests should be readable and easy to understand
            - Tests should be concise and focused
            - Tests should be independent and isolated
            - Tests should be repeatable and consistent
            - Follow Clean Code Principles
            - Use the ${framework} syntax for the unit test
            - Add relevant assertions and required packages in a single 'describe' block
            - Add relevant test cases in 'it' blocks
            - Add relevant setup and teardown code in 'beforeEach' and 'afterEach' blocks
    `;
  };

  private prDescriptionPrompt = (pullRequest: PullRequest, diff: string) => {
    return `Create a pull request description for the following pull request:
                Instructions:
                - Provide a description for the pull request
                - Provide a detailed description of the changes
                - Use Markdown for formatting for the description string
                - The description should be concise and informative amd human readable and understandable
                - Use the following format for the description:
                    - Summary
                    - List of changes
                
                Pull Request information pull request to describe:
                ## Pull Request Title: ${pullRequest.title}
                ## Pull Request Description: ${pullRequest.description}
                ## Pull Request Number: ${pullRequest.number}
                ## Pull Request Owner: ${pullRequest.owner}
                ## Pull Request Name: ${pullRequest.name}
                
                Code diff to describe for the pull request description:
                \`\`\`
                ${diff}
                \`\`\``;
  };
}
