import OpenAI from 'openai';
import { OPENAI_API_KEY } from '../config';

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export const processLLM = async (): Promise<any> => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a medical AI assistant that **strictly** follows this format:
                    {
                        "checklist": ["Immediate task 1", "Immediate task 2"],
                        "plan": [
                            { "task": "Scheduled task 1", "schedule": "6h", "type": "interval" },
                            { "task": "Scheduled task 2", "schedule": "0 8 * * *", "type": "cron" },
                            { "task": "Scheduled task 3", "schedule": "14d", "type": "interval" }
                        ]
                    }
                    
                    **Rules:**
                    - If a task is time-based, use **cron format** (0 8 * * * for **"daily at 8 AM"**).
                    - If a task is interval-based, return a **duration string** (6h for **"every 6 hours"**).
                    - If a task is one-time, return **a duration** (14d for **"in 2 weeks"**).`,
        },
        {
          role: 'user',
          content: `Doctor's Note:\n\n""\n\nExtract structured tasks **strictly in JSON**.`,
        },
      ],
      temperature: 0.1,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    });

    const output = response.choices[0].message.content;
    const parsedOutput = JSON.parse(output);

    return {
      checklist: parsedOutput.checklist || [],
      plan: parsedOutput.plan || [],
    };
  } catch (error) {
    console.log(error);
    throw new Error(`Failed to process. -- ${error}`);
  }
};
