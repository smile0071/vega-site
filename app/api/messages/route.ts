import { NextResponse } from "next/server";

import { pusherServer } from "@/app/libs/pusher";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/get-current-user";
import { getAIReply } from "@/app/libs/ai-chat";

export async function POST(req: Request) {
	try {
		const currentUser = await getCurrentUser();
		const body = await req.json();
		const { message, image, conversationId } = body;

		if (!currentUser?.id || !currentUser?.email)
			return new NextResponse("Unauthorized.", { status: 401 });

		const newMessage = await prisma.message.create({
			data: {
				body: message,
				image,
				conversation: {
					connect: {
						id: conversationId,
					},
				},
				sender: {
					connect: {
						id: currentUser.id,
					},
				},
				seen: {
					connect: {
						id: currentUser.id,
					},
				},
			},
			include: {
				seen: true,
				sender: true,
			},
		});

		const updatedConversation = await prisma.conversation.update({
			where: {
				id: conversationId,
			},
			data: {
				lastMessageAt: new Date(),
				messages: {
					connect: {
						id: newMessage.id,
					},
				},
			},
			include: {
				users: true,
				messages: {
					include: {
						seen: true,
					},
				},
			},
		});

		await pusherServer.trigger(conversationId, "messages:new", newMessage);

		const lastMessage =
			updatedConversation.messages[updatedConversation.messages.length - 1];

		updatedConversation.users.map((user) => {
			pusherServer.trigger(user.email!, "conversation:update", {
				id: conversationId,
				messages: [lastMessage],
			});
		});
		// --- АВТОМАТИЧЕСКИЙ ОТВЕТ ИИ ---
		// Проверяем, есть ли в чате AI-пользователь
		const aiUser = updatedConversation.users.find(
			(u) => u.email === "ai@bot.com"
		);
		if (aiUser && currentUser.email !== "ai@bot.com" && message) {
			try {
				const aiReply = await getAIReply(message);

				const aiMessage = await prisma.message.create({
					data: {
						body: aiReply,
						conversation: {
							connect: {
								id: conversationId,
							},
						},
						sender: {
							connect: {
								id: aiUser.id,
							},
						},
						seen: {
							connect: {
								id: aiUser.id,
							},
						},
					},
					include: {
						seen: true,
						sender: true,
					},
				});

				await pusherServer.trigger(conversationId, "messages:new", aiMessage);

				updatedConversation.users.map((user) => {
					pusherServer.trigger(user.email!, "conversation:update", {
						id: conversationId,
						messages: [aiMessage],
					});
				});
			} catch (e) {
				console.log("AI_REPLY_ERROR:", e);
			}
		}
		// --- КОНЕЦ БЛОКА АВТОМАТИЧЕСКОГО ОТВЕТА ИИ ---

		return NextResponse.json(newMessage);
	} catch (error: unknown) {
		console.log("ERROR_MESSAGES:", error);
		return new NextResponse("Internal Server Error.", { status: 500 });
	}
}
