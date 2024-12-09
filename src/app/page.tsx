"use client";
import { useState } from "react";
import completion from "./openai";
import { Input } from "@/components/ui/input"


export default function Home() {
  const [prompt, setPrompt] = useState("");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    console.log(prompt);
  }

  return (
    <>
      <div className="flex flex-col items-center justify-center">
        Hello world
        {completion.choices[0].message.content}
      </div>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col items-center justify-center">
          <Input type="text" className="w-full md:w-1/2" />
          <button type="submit">Send</button>
        </div>
      </form>
    </>
  );
}
