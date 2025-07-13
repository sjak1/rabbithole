import "dotenv/config";
import OpenAI from "openai";

const openai = new OpenAI({
    apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
});

const stream = await openai.responses.create({
    model: "gpt-4o-mini",
    input: [
        {
            role: "user",
            content: "Say 'double bubble bath' ten times fast.",
        }
    ],
    stream: true,
});

for await (const chunk of stream) {
    console.log(chunk);
}