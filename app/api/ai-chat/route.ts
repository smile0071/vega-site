/* import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";

export async function POST(req: NextRequest) {
	const { message } = await req.json();
	const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

	const completion = await groq.chat.completions.create({
		model: "gemma2-9b-it",
		messages: [{ role: "user", content: message }],
	});
	return NextResponse.json({ reply: completion.choices[0]?.message?.content });
}
 */

import { NextRequest, NextResponse } from "next/server";
import { getAIReply } from "@/app/libs/ai-chat";

export async function POST(req: NextRequest) {
	const { message } = await req.json();
	const reply = await getAIReply(message);
	return NextResponse.json({ reply });
}
