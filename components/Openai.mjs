import OpenAI from "openai";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function getCompletion() {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: "Write a haiku about the ocean." },
      ],
    });;

    console.log(completion.choices[0].message.content);
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
  }
}

getCompletion();
