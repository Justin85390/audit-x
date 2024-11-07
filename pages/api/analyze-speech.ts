import OpenAI from 'openai';
import type { NextApiRequest, NextApiResponse } from 'next';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { text } = req.body;

    const prompt = `Analyze this text and assess the speaker's language level on the CEFR scale (A1 to C2) considering:
    1. Grammar complexity and accuracy
    2. Vocabulary range and appropriateness
    3. Coherence and flow of ideas
    4. Overall fluency

    Text to analyze: "${text}"

    Please provide a detailed analysis with specific examples from the text and a final CEFR level assessment.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are an expert CEFR language assessor." },
        { role: "user", content: prompt }
      ],
    });

    const analysis = completion.choices[0].message?.content;

    res.status(200).json({ analysis });
  } catch (error) {
    console.error('Error analyzing speech:', error);
    res.status(500).json({ error: 'Error analyzing speech' });
  }
}