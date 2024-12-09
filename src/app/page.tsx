"use client";
import { useState } from "react";
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import getCompletion from "./openai";

export default function Home() {
  const [message, setMessage] = useState("");
  const [response, setResponse] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const completion = await getCompletion({ message });
    setResponse(completion.choices[0].message.content ?? "No response");
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col items-center justify-center">
          <Input type="text" className="w-full md:w-1/2" value={message} onChange={(e) => setMessage(e.target.value)} />
          <Button type="submit" variant="outline">Send</Button>
        </div>
      </form>

      {response && <Badge>{response}</Badge>}

    </>
  );
}
