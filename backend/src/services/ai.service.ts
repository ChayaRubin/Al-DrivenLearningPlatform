import OpenAI from 'openai';
import { config } from '../config';
import { AppError } from '../lib/errors';

const openai = new OpenAI({ apiKey: config.openai.apiKey });

export async function generateLesson(
  categoryName: string,
  subCategoryName: string,
  userPrompt: string
): Promise<string> {
  if (!config.openai.apiKey) {
    throw new AppError('OPENAI_API_KEY is not configured', 500);
  }
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a helpful teacher. Create a clear, structured lesson based on the user's learning request. Use the category "${categoryName}" and sub-category "${subCategoryName}" as context. Format the lesson with short paragraphs and optional bullet points. Do not use markdown headers.`,
        },
        {
          role: 'user',
          content: userPrompt,
        },
      ],
      max_tokens: 1000,
    });
    const text = completion.choices[0]?.message?.content?.trim();
    if (!text) {
      throw new AppError('Empty response from AI', 502);
    }
    return text;
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new AppError(`AI service error: ${err.message}`, 502);
    }
    throw new AppError('AI service error', 502);
  }
}

/** Generate a category image with DALL·E; returns data URL (base64). */
export async function generateCategoryImage(categoryName: string): Promise<string> {
  if (!config.openai.apiKey) {
    throw new AppError('OPENAI_API_KEY is not configured', 500);
  }
  try {
    const response = await openai.images.generate({
      model: 'dall-e-2',
      prompt: `Professional, modern illustration for an educational learning category: "${categoryName}". Clean, friendly, suitable for a learning platform. No text in the image.`,
      n: 1,
      size: '512x512',
      response_format: 'b64_json',
    });
    const data = response.data;
    const b64 = data?.[0]?.b64_json;
    if (!b64) throw new AppError('No image data from AI', 502);
    return `data:image/png;base64,${b64}`;
  } catch (err: unknown) {
    const msg =
      (err as { message?: string })?.message ||
      (err as { error?: { message?: string } })?.error?.message ||
      'Unknown error';
    throw new AppError(`AI image error: ${msg}`, 502);
  }
}
