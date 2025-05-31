// test_README.md

import request from "supertest";
import { createServer } from "http";
import app from "../app"; // Импортируйте ваш сервер Next.js или Express

describe("Messenger Clone E2E", () => {
  let server: any;
  let agent: any;
  let user1: any;
  let user2: any;
  let conversationId: string;

  beforeAll((done) => {
    server = createServer(app);
    server.listen(done);
    agent = request.agent(server);
  });

  afterAll((done) => {
    server.close(done);
  });

  it("Успешная регистрация пользователя и отказ при повторном email", async () => {
    const res1 = await agent.post("/api/register").send({
      email: "test1@example.com",
      name: "Test User",
      password: "password123",
    });
    expect(res1.status).toBe(200);
    expect(res1.body.email).toBe("test1@example.com");

    const res2 = await agent.post("/api/register").send({
      email: "test1@example.com",
      name: "Test User",
      password: "password123",
    });
    expect(res2.status).not.toBe(200);
  });

  it("Отправка сообщения и появление у всех участников", async () => {
    // Регистрация второго пользователя
    const res2 = await agent.post("/api/register").send({
      email: "test2@example.com",
      name: "Test User 2",
      password: "password123",
    });
    expect(res2.status).toBe(200);

    // Создание чата
    const convRes = await agent.post("/api/conversations").send({
      userId: res2.body.id,
    });
    expect(convRes.status).toBe(200);
    conversationId = convRes.body.id;

    // Отправка сообщения
    const msgRes = await agent.post("/api/messages").send({
      conversationId,
      message: "Hello!",
    });
    expect(msgRes.status).toBe(200);

    // Проверка истории
    const historyRes = await agent.get(`/api/conversations/${conversationId}`);
    expect(historyRes.body.messages.some((m: any) => m.content === "Hello!")).toBeTruthy();
  });

  it("Проверка автоматического ответа ИИ-ассистента", async () => {
    // Создать чат с AI
    const aiConvRes = await agent.post("/api/ai-conversation").send({});
    expect(aiConvRes.status).toBe(200);
    const aiConvId = aiConvRes.body.conversationId;

    // Отправить сообщение
    const msgRes = await agent.post("/api/messages").send({
      conversationId: aiConvId,
      message: "Привет, бот!",
    });
    expect(msgRes.status).toBe(200);

    // Проверить, что есть ответ от AI
    const historyRes = await agent.get(`/api/conversations/${aiConvId}`);
    const aiReply = historyRes.body.messages.find((m: any) => m.sender.email === "ai@bot.com");
    expect(aiReply).toBeDefined();
  });

  it("Проверка механизма «прочитано»", async () => {
    // Отправить сообщение
    const msgRes = await agent.post("/api/messages").send({
      conversationId,
      message: "Check read",
    });
    expect(msgRes.status).toBe(200);

    // Второй пользователь открывает чат
    const seenRes = await agent.post(`/api/conversations/${conversationId}/seen`).send({});
    expect(seenRes.status).toBe(200);

    // Проверить, что сообщение помечено как прочитанное
    const historyRes = await agent.get(`/api/conversations/${conversationId}`);
    const lastMsg = historyRes.body.messages.slice(-1)[0];
    expect(lastMsg.seen.length).toBeGreaterThan(0);
  });

  it("Ограничение доступа к защищённым маршрутам для неавторизованных пользователей", async () => {
    const unauthAgent = request.agent(server);
    const res = await unauthAgent.get("/users");
    expect(res.status).toBe(401); // Или 302 редирект на /login
  });
});