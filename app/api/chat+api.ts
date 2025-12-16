import { MOTOHERE_SYSTEM_PROMPT } from '@/lib/ai/prompt';
import { createToolSet, MotoHereUIMessage } from '@/lib/ai/tools';
import { openai } from '@ai-sdk/openai';
import { convertToModelMessages, stepCountIs, streamText } from 'ai';

export async function POST(req: Request) {
  const { messages, accessToken }: { messages: MotoHereUIMessage[]; accessToken: string } =
    await req.json();

  const tools = createToolSet(accessToken);

  const result = streamText({
    system: MOTOHERE_SYSTEM_PROMPT,
    model: openai('gpt-4o-mini'),
    messages: convertToModelMessages(messages),
    stopWhen: stepCountIs(1),
    tools,
  });

  return result.toUIMessageStreamResponse({
    headers: {
      'Content-Type': 'application/octet-stream',
      'Content-Encoding': 'none',
    },
  });
}
