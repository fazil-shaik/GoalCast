import { OpenAI } from 'openai';
import { Request, Response } from 'express';
import dotenv from 'dotenv'
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req: Request, res: Response) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { note } = req.body;

    if (!note) {
      return res.status(400).json({ error: 'Note is required' });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that enhances daily check-in notes for goals. Make the notes more detailed, professional, and motivating while maintaining the original meaning. Keep the enhancement concise and natural."
        },
        {
          role: "user",
          content: note
        }
      ],
      max_tokens: 150,
      temperature: 0.7,
    });

    const enhancedNote = completion.choices[0]?.message?.content || note;

    return res.status(200).json({ enhancedNote });
  } catch (error) {
    console.error('Error enhancing note:', error);
    return res.status(500).json({ error: 'Failed to enhance note' });
  }
} 