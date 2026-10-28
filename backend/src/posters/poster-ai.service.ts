import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { PosterCopy, PosterPayload, PosterType } from './poster.types.js';

const GEMINI_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

@Injectable()
export class PosterAiService {
  private readonly logger = new Logger(PosterAiService.name);

  constructor(private readonly configService: ConfigService) {}

  /** Throws on any failure; the caller decides whether to fall back. */
  async generateCopy(
    payload: PosterPayload,
    posterType: PosterType,
  ): Promise<Partial<PosterCopy>> {
    const apiKey = this.configService.getOrThrow<string>('GOOGLE_GENAI_API_KEY');

    const prompt = `Write a ${posterType} pet poster copy from structured pet data.
Return ONLY valid JSON:
{
  "headline": "LOST {species} or FOUND {species} ex: LOST DOG, FOUND CAT, LOST COW — 2 words, uppercase",
  "subheadline": "one warm sentence asking for help finding them",
  "description": "2 sentences: physical description, temperament, what makes them identifiable. Warm, human tone.",
  "cta": "one sentence telling people what to do if they see the pet",
  "lastSeenLocation": "extract the street name and city from the last seen location, if available",
  "lastSeenDate": "extract the date from the last seen time, if available, format as Month Day, Year"
}`;

    const response = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [
          { parts: [{ text: prompt }, { text: JSON.stringify(payload) }] },
        ],
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Gemini API ${response.status}: ${body}`);
    }

    const data: any = await response.json();
    const text: string | undefined =
      data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty response from Gemini API');

    try {
      return this.parseJson(text);
    } catch (err) {
      this.logger.error('Failed to parse Gemini response', err as Error);
      throw new Error('Invalid JSON response from Gemini API');
    }
  }

  private parseJson(text: string): Partial<PosterCopy> {
    const clean = text
      .trim()
      .replace(/^```(?:json)?/i, '')
      .replace(/```$/, '')
      .trim();
    return JSON.parse(clean);
  }
}
