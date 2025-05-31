import Groq from "groq-sdk";

export async function getAIReply(message: string) {
	const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });
	const completion = await groq.chat.completions.create({
		model: "gemma2-9b-it",
		messages: [{ role: "user", content: message }],
	});
	return completion.choices[0]?.message?.content || "Я здесь!";
}
