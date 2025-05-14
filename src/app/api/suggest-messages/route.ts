import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

const model = google('gemini-1.5-flash-latest');

export async function POST(req: Request) {
   try {
      const prompt =
         "Generate three fresh, creative, and natural questions you would ask someone you just met. Ensure the questions are not generic, feel conversational, and show genuine curiosity. Return the result as one single string with each question separated by ||. Do not repeat questions from previous responses.Avoid reusing phrasing or themes from earlier outputs. Make each response feel unique, as if you're meeting a very different person each time.";

      const { text } = await generateText({ model, prompt, maxTokens: 100 });


      return Response.json(
         {
            success: true,
            message: text,
         },
         { status: 200 }
      );
   } catch (error) {
      throw error;
   }
}
