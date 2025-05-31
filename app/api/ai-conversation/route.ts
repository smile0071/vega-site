import { NextRequest, NextResponse } from "next/server";

import { getServerSession } from "next-auth";
import prisma from "@/app/libs/prismadb";
import { authOptions } from "@/app/config/authOptions";

export async function POST(req: NextRequest) {
	const session = await getServerSession(authOptions);
	if (!session?.user?.email) {
		return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
	}

	// Найти или создать AI-пользователя
	let aiUser = await prisma.user.findUnique({ where: { email: "ai@bot.com" } });
	if (!aiUser) {
		aiUser = await prisma.user.create({
			data: {
				name: "AI",
				email: "ai@bot.com",
				image: "/images/ai-avatar.jpg", // или любой аватар
			},
		});
	}

	// Найти существующий диалог с AI
	/* let conversation = await prisma.conversation.findFirst({
		where: {
			isGroup: false,
			users: {
				every: {
					OR: [{ email: session.user.email }, { email: "ai@bot.com" }],
				},
			},
		},
	});

	// Если нет — создать новый
	if (!conversation) {
		conversation = await prisma.conversation.create({
			data: {
				users: {
					connect: [{ email: session.user.email }, { email: "ai@bot.com" }],
				},
			},
		});
	} */
	// Получить текущего пользователя из базы по email
	const currentUser = await prisma.user.findUnique({
		where: { email: session.user.email },
	});
	if (!currentUser?.id || !aiUser?.id) {
		return NextResponse.json({ error: "User ID not found" }, { status: 400 });
	}

	// Найти существующий диалог с AI
	let conversation = await prisma.conversation.findFirst({
		where: {
			isGroup: false,
			userIds: {
				hasEvery: [aiUser.id, currentUser.id],
			},
		},
	});

	if (conversation) {
		return NextResponse.json({ conversationId: conversation.id });
	}

	// Если нет — создать новый диалог
	conversation = await prisma.conversation.create({
		data: {
			userIds: [aiUser.id, currentUser.id],
		},
	});

	return NextResponse.json({ conversationId: conversation.id });
}
