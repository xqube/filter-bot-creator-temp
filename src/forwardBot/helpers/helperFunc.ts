import { Bot, Context, InlineKeyboard } from "grammy";
import ngrok from "@ngrok/ngrok";
import crypto from "crypto";
import { webhookurl } from "../../server.js";

const { PORT, SECRET_TOKEN } = process.env;

export const ngrokurlgen = async () => {
  const listener = await ngrok.forward({
    addr: PORT,
    authtoken: SECRET_TOKEN,
  });

  return listener.url();
};