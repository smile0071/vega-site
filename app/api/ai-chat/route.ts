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

const deadlinePatterns = [
	/крайний срок.*курсовой/i,
	/дедлайн.*курсовой/i,
	/когда.*сдач[аи].*курсовой/i,
];

const deadlineReply = `Крайний срок сдачи курсовой работы по вашему направлению — 15 июня 2025 года. Пожалуйста, обратите внимание: оформление должно соответствовать ГОСТ 7.32-2017. Подробно расписано на странице регламента: /university/regulations/2025/cursive-guidelines.`;

export async function POST(req: NextRequest) {
	const { message } = await req.json();

	// Проверяем, подходит ли сообщение под фильтр
	if (deadlinePatterns.some((re) => re.test(message))) {
		return NextResponse.json({ reply: deadlineReply });
	}

	// Обычная логика AI-ответа
	const reply = await getAIReply(message);
	return NextResponse.json({ reply });
}
