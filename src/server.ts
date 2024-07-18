import { Api, Bot, Context, RawApi, webhookCallback } from "grammy";
import { fastify, FastifyReply, FastifyRequest } from "fastify";
import { autoRetry } from "@grammyjs/auto-retry";
import "dotenv/config";
import { ngrokurlgen } from "./forwardBot/helpers/helperFunc.js";
import { forwardBotComposer } from "./forwardBot/controllers/forwardbotComposer.js";
import { SlaveforwardBotComposer } from "./forwardBot/controllers/slaveComposer.js";
import { forwardbotmongoconnect } from "./forwardBot/db/dbConfig.js";

export type MyContext = Context;

const app = fastify();

// export const botsMap = new Map();
export const filterMongoMap = new Map();

const {FORWARD_BOT_TOKEN, PORT, WEBHOOK_URL, OWNER } = process.env;

export let owner: unknown


export let forwardbot: Bot<Context, Api<RawApi>>
export let forwardbotres: boolean

(async function () {
  const db = await forwardbotmongoconnect();
  if (db) {
    console.log("Connected successfully to Forward bot DB server");
  }
})();

// export const webhookurl = await ngrokurlgen();
export const webhookurl = WEBHOOK_URL;
if(webhookurl){
  console.log(webhookurl);

owner = OWNER;


forwardbot = new Bot(FORWARD_BOT_TOKEN as string);
forwardbotres = await forwardbot.api.setWebhook(
  `${webhookurl}/forwardbotmain/${FORWARD_BOT_TOKEN}`,
  {
    drop_pending_updates: true,
  }
);

console.log(forwardbotres);


forwardbot.api.config.use(autoRetry());
forwardbot.use(forwardBotComposer);

app.post(
  `/forwardbotmain/:token`,
  async (req: FastifyRequest, res: FastifyReply) => {
    await webhookCallback(forwardbot, "fastify")(req, res);
  }
);

app.post(
  "/forwardbots/:token",
  async (req: FastifyRequest, res: FastifyReply) => {
    const { token } = req.params as { token: string };
    const bot = new Bot<MyContext>(token);
    bot.api.config.use(autoRetry());
    bot.use(SlaveforwardBotComposer);
    await webhookCallback(bot, "fastify")(req, res);
  }
);

app.setErrorHandler(async (error) => {
  console.error(error);
});

if (PORT) {
  app.listen({ port: +PORT }, async (error) => {
    if (error) {
      console.error(error);
      process.exit(1);
    }
    console.log(`bot runs at: ${webhookurl}`);
  });
}
}
