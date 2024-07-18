import { Bot, webhookCallback } from "grammy";
import { fastify } from "fastify";
import { autoRetry } from "@grammyjs/auto-retry";
import "dotenv/config";
import { forwardBotComposer } from "./forwardBot/controllers/forwardbotComposer.js";
import { SlaveforwardBotComposer } from "./forwardBot/controllers/slaveComposer.js";
import { forwardbotmongoconnect } from "./forwardBot/db/dbConfig.js";
const app = fastify();
// export const botsMap = new Map();
export const filterMongoMap = new Map();
const { FORWARD_BOT_TOKEN, PORT, WEBHOOK_URL, OWNER } = process.env;
export let owner;
export let forwardbot;
export let forwardbotres;
(async function () {
    const db = await forwardbotmongoconnect();
    if (db) {
        console.log("Connected successfully to Forward bot DB server");
    }
})();
// export const webhookurl = await ngrokurlgen();
export const webhookurl = WEBHOOK_URL;
if (webhookurl) {
    console.log(webhookurl);
    owner = OWNER;
    forwardbot = new Bot(FORWARD_BOT_TOKEN);
    forwardbotres = await forwardbot.api.setWebhook(`${webhookurl}/forwardbotmain/${FORWARD_BOT_TOKEN}`, {
        drop_pending_updates: true,
    });
    console.log(forwardbotres);
    forwardbot.api.config.use(autoRetry());
    forwardbot.use(forwardBotComposer);
    app.post(`/forwardbotmain/:token`, async (req, res) => {
        await webhookCallback(forwardbot, "fastify")(req, res);
    });
    app.post("/forwardbots/:token", async (req, res) => {
        const { token } = req.params;
        const bot = new Bot(token);
        bot.api.config.use(autoRetry());
        bot.use(SlaveforwardBotComposer);
        await webhookCallback(bot, "fastify")(req, res);
    });
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
