"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const EmptyState = () => {
	const router = useRouter();
	const [aiReply, setAiReply] = useState("");

	const handleAIChat = async () => {
		const res = await fetch("/api/ai-conversation", { method: "POST" });
		const data = await res.json();
		if (data.conversationId) {
			router.push(`/conversations/${data.conversationId}`);
		}
	};

	return (
		<div className="px-4 py-10 sm:px-6 lg:px-8 h-full flex justify-center items-center bg-gray-100">
			<div className="text-center items-center flex flex-col">
				<h3 className="mt-2 text-2xl font-semibold text-gray-900">
					Выбери чат или начни новый
				</h3>
				<button
					className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
					onClick={handleAIChat}
				>
					Начать чат с ИИ
				</button>
				{aiReply && (
					<div className="mt-4 p-4 bg-white rounded shadow text-gray-800">
						Ответ ИИ: {aiReply}
					</div>
				)}
			</div>
		</div>
	);
};

export default EmptyState;
